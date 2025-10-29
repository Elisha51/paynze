
import { NextRequest, NextResponse } from 'next/server';
import { updateOrder } from '@/services/orders';
import { getOrderById } from '@/services/orders';
import { addTransaction } from '@/services/finances';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // In a real-world scenario, you would validate the webhook signature here
    // to ensure the request is coming from the actual payment provider.

    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ message: 'Missing orderId or status' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
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
          type: 'Income',
          category: 'Sales',
          status: 'Cleared',
          paymentMethod: order.payment.method,
      });
      
      console.log(`Webhook: Order ${orderId} successfully updated to Paid and transaction recorded.`);
      return NextResponse.json(updatedOrder);

    } else if (status === 'FAILED') {
      const updatedOrder = await updateOrder(orderId, {
        payment: { ...order.payment, status: 'failed' }
      });
      console.log(`Webhook: Order ${orderId} payment failed.`);
      return NextResponse.json(updatedOrder);
    }
    
    return NextResponse.json({ message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
