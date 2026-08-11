import type { Prisma } from '../../.prisma/client/client';
import type { Request, Response, NextFunction } from 'express';
import prisma from '../libs/prisma';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, customerId, serviceId, status, items = [] } = req.body as {
      vehicleId?: string | number
      customerId?: string | number
      serviceId?: string | number
      status?: string
      items?: {
        serviceId?: number | string
        duration?: number | string
        amount?: number | string
        price?: number | string
        qty?: number | string
        subtotal?: number | string
      }[]
    };

    const vId = Number(vehicleId)
    const cId = Number(customerId)
    const sId = Number((req as any).user?.id)

    if (!vId || !cId || !sId) {
      return res.status(400).json({ message: 'vehicleId, customerId are required and you must be logged in.' });
    }

    const validItems = items.filter((item) => item.serviceId)

    if (validItems.length === 0) {
      return res.status(400).json({ message: 'At least one service is required.' });
    }

    const [vehicle, customer, staff] = await Promise.all([
      prisma.vehicles.findUnique({ where: { id: vId } }),
      prisma.customers.findUnique({ where: { id: cId } }),
      prisma.user.findUnique({ where: { id: sId } }),
    ]);

    if (!vehicle) return res.status(404).json({ message: `Vehicle with ID ${vId} not found.` });
    if (!customer) return res.status(404).json({ message: `Customer with ID ${cId} not found.` });
    if (!staff) return res.status(404).json({ message: `Staff/user with ID ${sId} not found.` });

    const newOrder = await prisma.orders.create({
      data: {
        vehicleId: vId,
        customerId: cId,
        staffId: sId,
        status: status || 'PENDING',
        order_items: {
          create: validItems.map((item) => ({
            serviceId: Number(item.serviceId),
            duration: Number(item.duration),
            amount: Number(item.amount),
            price: Number(item.price),
            qty: Number(item.qty),
            subtotal: Number(item.subtotal),
          })),
        },
      },
      include: {
        vehicle: true,
        customer: true,
        staff: { select: { id: true, name: true, email: true } },
        order_items: {
          include: {
            service: true,
          },
        },
        payements: true,
      },
    });

    return res.status(201).json({
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ordersWhereInput = {};
    if (search) {
      where.OR = [
        { vehicle: { name: { contains: search as string, mode: 'insensitive' } } },
        { customer: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }
    if (status) {
      where.status = status as string;
    }

    const [orders, total_data] = await Promise.all([
      prisma.orders.findMany({
        where,
        take: limitNum,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: true,
          customer: true,
          staff: { select: { id: true, name: true, email: true } },
          order_items: {
            include: {
              service: true,
            },
          },
          payements: true,
        },
      }),
      prisma.orders.count({ where }),
    ]);

    return res.status(200).json({
      message: 'Orders retrieved successfully',
      meta: {
        current_page: pageNum,
        limit: limitNum,
        total_data,
        total_pages: Math.ceil(total_data / limitNum),
      },
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.orders.findUnique({
      where: { id: Number(id) },
      include: {
        vehicle: true,
        customer: true,
        staff: { select: { id: true, name: true, email: true } },
        order_items: {
          include: {
            service: true,
          },
        },
        payements: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { vehicleId, customerId, staffId, status, items = [] } = req.body;

    const updatedOrder = await prisma.orders.update({
      where: { id: Number(id) },
      data: {
        vehicleId: Number(vehicleId),
        customerId: Number(customerId),
        staffId: Number(staffId),
        status,
        order_items: {
          deleteMany: {},
          create: items.map((item) => ({
            serviceId: Number(item.serviceId),
            duration: Number(item.duration),
            amount: Number(item.amount),
            price: Number(item.price),
            qty: Number(item.qty),
            subtotal: Number(item.subtotal),
          })),
        },
      },
      include: {
        vehicle: true,
        customer: true,
        staff: { select: { id: true, name: true, email: true } },
        order_items: {
          include: {
            service: true,
          },
        },
        payements: true,
      },
    });

    return res.status(200).json({
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.orders.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
