"use client";

import { useMemo } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc } from "../../convex/_generated/dataModel";

interface ReferralChartProps {
    referrals: Doc<"referrals">[];
}

export default function ReferralActivityChart({ referrals }: ReferralChartProps) {
    const chartData = useMemo(() => {
        const data = [];
        const today = new Date();

        // Generate last 7 days including today
        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dayStart = startOfDay(date);
            const dayEnd = endOfDay(date);

            const count = referrals.filter(r => {
                const rDate = new Date(r._creationTime);
                return rDate >= dayStart && rDate <= dayEnd;
            }).length;

            data.push({
                name: format(date, "EEE"), // Mon, Tue, etc.
                fullDate: format(date, "MMM d"),
                referrals: count
            });
        }
        return data;
    }, [referrals]);

    return (
        <Card className="shadow-sm border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Referral Activity</CardTitle>
                <select className="bg-gray-50 dark:bg-gray-800 border-none text-xs text-gray-500 rounded-lg py-1 px-2 focus:ring-0 cursor-pointer outline-none">
                    <option>This Week</option>
                    <option>Last Month</option>
                    <option>Last Year</option>
                </select>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#007bff" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#007bff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                                cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="referrals"
                                stroke="#007bff"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorReferrals)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
