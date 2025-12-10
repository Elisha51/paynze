
import { NextRequest, NextResponse } from 'next/server';
import { updateOrder } from '@/services/orders';
import { getOrderById } from '@/services/orders';
import { addTransaction } from '@/services/finances';
import { processOrderForCommission } from '@/services/commissions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook received:", body);

    // In a real-world scenario, you would validate the webhook signature here
    // to ensure the request is coming from the actual payment provider.

    const { orderId, status } = body;

    if (!orderId || !status) {
      console.error('Webhook Error: Missing orderId or status');
      return NextResponse.json({ message: 'Missing orderId or status' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      console.error(`Webhook Error: Order ${orderId} not found`);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (status === 'SUCCESS') {
      const transactionId = `txn_${Date.now()}`;
      // Update the order status to 'Paid' and payment status to 'completed'
      const updatedOrder = await updateOrder(orderId, { 
        status: 'Paid', 
        payment: { ...order.payment, status: 'completed', transactionId }
      });
      
      // Add a corresponding transaction to the financial ledger
      await addTransaction({
          date: new Date().toISOString(),
          description: `Sale from Order #${orderId}`,
          amount: order.total,
          currency: order.currency,
          type: 'Income',
          category: 'Sales',
          status: 'Cleared',
          paymentMethod: order.payment.method,
      });

      // After successful payment, process commissions
      await processOrderForCommission(updatedOrder);
      
      console.log(`Webhook: Order ${orderId} successfully updated to Paid and transaction recorded.`);
      return NextResponse.json(updatedOrder);

    } else if (status === 'FAILED') {
      const updatedOrder = await updateOrder(orderId, {
        payment: { ...order.payment, status: 'failed' }
      });
      console.log(`Webhook: Order ${orderId} payment failed.`);
      return NextResponse.json(updatedOrder);
    }
    
    console.log(`Webhook for order ${orderId} processed with status: ${status}`);
    return NextResponse.json({ message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
