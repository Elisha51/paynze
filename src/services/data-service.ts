
'use client';

import { OnboardingFormData } from "@/context/onboarding-context";

export class DataService<T extends { id: string | number } | { sku: string } | { name: string }> {
  private dataKey: string;
  private primaryKey: keyof T;
  private initialize: () => T[] | Promise<T[]>;

  constructor(
    dataKey: string, 
    initialize: () => T[] | Promise<T[]>,
    primaryKey?: keyof T,
  ) {
    this.dataKey = dataKey;
    this.initialize = initialize;
    
    // @ts-ignore
    this.primaryKey = primaryKey || 'id';
  }

  private getTenantId(): string {
    if (typeof window === 'undefined') {
        return 'default';
    }
    const onboardingDataRaw = localStorage.getItem('onboardingData');
    if (onboardingDataRaw) {
        const data = JSON.parse(onboardingDataRaw) as OnboardingFormData;
        return data.subdomain || 'default';
    }
    return 'default';
  }

  private getStorageKey(): string {
    return `${this.dataKey}_${this.getTenantId()}`;
  }

  private async getData(): Promise<T[]> {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate micro-delay
    if (typeof window === 'undefined') {
        return await this.initialize();
    }
    const storageKey = this.getStorageKey();
    const data = localStorage.getItem(storageKey);
    if (data) {
      return JSON.parse(data);
    } else {
      const initialData = await this.initialize();
      localStorage.setItem(storageKey, JSON.stringify(initialData));
      return initialData;
    }
  }

  private async setData(data: T[]): Promise<void> {
     if (typeof window !== 'undefined') {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
     }
  }

  async getAll(): Promise<T[]> {
    return await this.getData();
  }

  async getById(id: string | number): Promise<T | undefined> {
    const data = await this.getData();
    // @ts-ignore
    return data.find(item => item[this.primaryKey] === id);
  }

  async create(item: T, options: { prepend?: boolean } = {}): Promise<T> {
    const data = await this.getData();
    if (options.prepend) {
      data.unshift(item);
    } else {
      data.push(item);
    }
    await this.setData(data);
    return item;
  }

  async update(id: string | number, updates: Partial<T>): Promise<T> {
    const data = await this.getData();
    let updatedItem: T | undefined;
    const updatedData = data.map(item => {
      // @ts-ignore
      if (item[this.primaryKey] === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    await this.setData(updatedData);
    if (!updatedItem) {
        throw new Error(`Item with id ${id} not found in ${this.dataKey}.`);
    }
    return updatedItem;
  }

  async delete(id: string | number): Promise<void> {
    const data = await this.getData();
    // @ts-ignore
    const updatedData = data.filter(item => item[this.primaryKey] !== id);
    await this.setData(updatedData);
  }
}
