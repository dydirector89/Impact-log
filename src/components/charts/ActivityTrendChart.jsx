import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ActivityTrendChart({ data, title = 'Activity Trends' }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [metric, setMetric] = useState('activities');

    const chartData = useMemo(() => {
        const labels = data.map(d => d.month);

        const datasets = {
            activities: {
                label: 'Activities',
                data: data.map(d => d.activities),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
            },
            co2Saved: {
                label: 'CO₂ Saved (kg)',
                data: data.map(d => d.co2Saved),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
            csrHours: {
                label: 'CSR Hours',
                data: data.map(d => d.csrHours),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
            },
        };

        return {
            labels,
            datasets: [
                {
                    ...datasets[metric],
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: datasets[metric].borderColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
            ],
        };
    }, [data, metric]);

    const tickColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#f1f5f9';

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDark ? '#0f172a' : '#1e293b',
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 12, weight: '500' },
                    color: tickColor,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: gridColor,
                },
                ticks: {
                    font: { size: 12 },
                    color: tickColor,
                },
            },
        },
    };

    const hasData = data.length > 0 && data.some(d => d.activities > 0 || d.co2Saved > 0 || d.csrHours > 0);

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <Tabs value={metric} onValueChange={setMetric}>
                        <TabsList className="h-8">
                            <TabsTrigger value="activities" className="text-xs px-3 h-6">Activities</TabsTrigger>
                            <TabsTrigger value="co2Saved" className="text-xs px-3 h-6">CO₂</TabsTrigger>
                            <TabsTrigger value="csrHours" className="text-xs px-3 h-6">Hours</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="h-72">
                    {hasData ? (
                        <Line data={chartData} options={options} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <p className="text-lg">No activity data yet</p>
                            <p className="text-sm">Trends will appear once activities are logged and approved</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
