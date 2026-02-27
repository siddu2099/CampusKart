import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch analytics data (protected Admin route)
                const { data } = await api.get('/analytics');
                setAnalytics(data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Prepare data for the Top Selling Products Bar Chart
    const chartData = {
        labels: analytics?.topSellingProducts?.map((p) => p.name) || [],
        datasets: [
            {
                label: 'Total Sold',
                data: analytics?.topSellingProducts?.map((p) => p.totalSold) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Top 5 Selling Products' },
        },
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin Dashboard</h2>

            {/* High-level summary metrics */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '150px' }}>
                    <h3>Total Users</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics?.totalUsers || 0}</p>
                </div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '150px' }}>
                    <h3>Total Orders</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics?.totalOrders || 0}</p>
                </div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '150px' }}>
                    <h3>Total Revenue</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${analytics?.totalRevenue || 0}</p>
                </div>
            </div>

            {/* Chart.js visualization */}
            <div style={{ maxWidth: '800px' }}>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default AdminDashboard;
