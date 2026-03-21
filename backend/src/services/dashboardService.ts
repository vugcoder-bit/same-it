import prisma from '../utils/prisma';

export const getDashboardStats = async () => {
    const [totalUsers, pendingOrders, completedOrders, successfulOrders] = await Promise.all([
        prisma.user.count(),
        prisma.order.count({ where: { status: 'PROCESSING' } }),
        prisma.order.count({ where: { status: 'SUCCESSFUL' } }),
        prisma.order.findMany({ where: { status: 'SUCCESSFUL' }, select: { totalPrice: true } }),
    ]);

    const totalRevenue = successfulOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    username: true,
                },
            },
            service: {
                select: {
                    title: true,
                },
            },
        },
    });

    return {
        totalUsers,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders,
    };
};
