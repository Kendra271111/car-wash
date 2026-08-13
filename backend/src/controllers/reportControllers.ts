import type { Request, Response, NextFunction } from 'express';
import prisma from '../libs/prisma';

export const getRevenueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await prisma.payments.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'PAID',
      },
      orderBy: { createdAt: 'asc' },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const dailyMap = new Map<string, number>();
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, 0);
    }

    for (const payment of payments) {
      const key = payment.createdAt.toISOString().split('T')[0];
      if (dailyMap.has(key)) {
        dailyMap.set(key, dailyMap.get(key)! + payment.amount);
      }
    }

    const data = Array.from(dailyMap.entries()).map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100,
    }));

    return res.status(200).json({
      message: 'Revenue report retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.orders.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        status: true,
        createdAt: true,
      },
    });

    const dailyMap = new Map<string, { total: number; completed: number }>();
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, { total: 0, completed: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split('T')[0];
      if (dailyMap.has(key)) {
        const current = dailyMap.get(key)!;
        current.total += 1;
        if (order.status === 'COMPLETED') current.completed += 1;
      }
    }

    const data = Array.from(dailyMap.entries()).map(([date, counts]) => ({
      date,
      total: counts.total,
      completed: counts.completed,
    }));

    return res.status(200).json({
      message: 'Orders report retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};
