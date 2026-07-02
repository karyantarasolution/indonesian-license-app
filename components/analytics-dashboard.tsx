"use client";

import { useLicenses } from "@/contexts/license-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Target,
  Zap,
  Award,
  Activity,
  MapPin,
  Building,
  Calendar,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity as ActivityIcon,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

const COLORS = [
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#ec4899", // Pink
  "#84cc16", // Lime
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const { licenses, getOverdueLicenses } = useLicenses();
  const overdueLicenses = getOverdueLicenses();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced KPI calculations
  const kpiData = useMemo(() => {
    const total = licenses.length;
    const completed = licenses.filter((l) => l.status === "selesai").length;
    const pending = licenses.filter((l) => 
      ["draft", "proses", "rekomendasi"].includes(l.status)
    ).length;
    const overdue = overdueLicenses.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate average processing time
    const completedLicenses = licenses.filter((l) => l.status === "selesai");
    const avgProcessingTime = completedLicenses.length > 0 
      ? Math.round(completedLicenses.reduce((acc, l) => acc + (l.perizinanHari || 0), 0) / completedLicenses.length)
      : 0;

    // Calculate efficiency score (0-100)
    const efficiencyScore = Math.max(0, 100 - (overdue * 10) - (pending * 2));

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      avgProcessingTime,
      efficiencyScore,
    };
  }, [licenses, overdueLicenses]);

  // Enhanced monthly trend data
  const monthlyTrendData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const currentYear = new Date().getFullYear();
    return months.map((month, index) => {
      const monthNumber = index + 1;
      const startDate = new Date(currentYear, index, 1);
      const endDate = new Date(currentYear, index + 1, 0);

      const monthLicenses = licenses.filter((license) => {
        const licenseDate = new Date(license.createdAt);
        return licenseDate >= startDate && licenseDate <= endDate;
      });

      const completed = monthLicenses.filter(l => l.status === "selesai").length;
      const pending = monthLicenses.filter(l => 
        ["draft", "proses", "rekomendasi"].includes(l.status)
      ).length;
      const overdue = monthLicenses.filter(l => 
        overdueLicenses.some(ol => ol.id === l.id)
      ).length;

      return {
        month,
        completed,
        pending,
        overdue,
        total: monthLicenses.length,
        efficiency: monthLicenses.length > 0 ? Math.round((completed / monthLicenses.length) * 100) : 0,
      };
    });
  }, [licenses, overdueLicenses]);

  // Sector performance data
  const sectorData = useMemo(() => {
    const sectorStats = licenses.reduce((acc, license) => {
      const sector = license.sektor || "Lainnya";
      if (!acc[sector]) {
        acc[sector] = { total: 0, completed: 0, pending: 0, overdue: 0 };
      }
      acc[sector].total++;
      
      if (license.status === "selesai") {
        acc[sector].completed++;
      } else if (["draft", "proses", "rekomendasi"].includes(license.status)) {
        acc[sector].pending++;
      }
      
      if (overdueLicenses.some(ol => ol.id === license.id)) {
        acc[sector].overdue++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(sectorStats).map(([sector, stats]) => ({
      name: sector,
      total: stats.total,
      completed: stats.completed,
      pending: stats.pending,
      overdue: stats.overdue,
      completionRate: Math.round((stats.completed / stats.total) * 100),
    }));
  }, [licenses, overdueLicenses]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const statusCounts = licenses.reduce((acc, license) => {
      const status = license.status || "draft";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: COLORS[Object.keys(statusCounts).indexOf(status) % COLORS.length],
    }));
  }, [licenses]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const weeklyCompleted = licenses.filter(l => 
      l.status === "selesai" && new Date(l.updatedAt) >= thisWeek
    ).length;
    
    const monthlyCompleted = licenses.filter(l => 
      l.status === "selesai" && new Date(l.updatedAt) >= thisMonth
    ).length;

    let expiredCount = 0;
    let warningCount = 0;

    for (const license of licenses) {
      if (license.status === "selesai" && license.berlakuSampai) {
        const validUntil = new Date(license.berlakuSampai);
        validUntil.setHours(0, 0, 0, 0);
        const todayZero = new Date();
        todayZero.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((validUntil.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          expiredCount++;
        } else if (diffDays <= 30) {
          warningCount++;
        }
      }
    }

    return {
      weeklyCompleted,
      monthlyCompleted,
      weeklyGrowth: weeklyCompleted > 0 ? Math.round((weeklyCompleted / 7) * 100) : 0,
      monthlyGrowth: monthlyCompleted > 0 ? Math.round((monthlyCompleted / 30) * 100) : 0,
      expiredCount,
      warningCount,
    };
  }, [licenses]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Perizinan */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Perizinan</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Semua jenis perizinan</span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.completionRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={kpiData.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Score */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.efficiencyScore}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Skor efisiensi sistem</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Processing Time */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.avgProcessingTime} hari</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Rata-rata waktu proses</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Minggu Ini</p>
                <p className="text-xl font-bold text-blue-900">{performanceMetrics.weeklyCompleted}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              +{performanceMetrics.weeklyGrowth}% dari target
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Bulan Ini</p>
                <p className="text-xl font-bold text-green-900">{performanceMetrics.monthlyCompleted}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              +{performanceMetrics.monthlyGrowth}% dari target
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Status</p>
                <p className="text-xl font-bold text-purple-900">
                  {kpiData.overdue > 0 ? "Perlu Perhatian" : "Berjalan Normal"}
                </p>
              </div>
              {kpiData.overdue > 0 ? (
                <AlertTriangle className="h-8 w-8 text-purple-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-purple-600" />
              )}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {kpiData.overdue} perizinan terlambat
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href='/dashboard/izin-expired'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Izin Mendekati Expired</p>
                <p className="text-xl font-bold text-amber-900">
                  {performanceMetrics.expiredCount + performanceMetrics.warningCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {performanceMetrics.expiredCount} expired, {performanceMetrics.warningCount} mendekati (≤30hr)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Sectors
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Overview Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Overview Bulanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      fill="#e0f2fe"
                      stroke="#0284c7"
                      strokeWidth={2}
                    />
                    <Bar dataKey="completed" fill="#10b981" />
                    <Bar dataKey="pending" fill="#f59e0b" />
                    <Bar dataKey="overdue" fill="#ef4444" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                  Distribusi Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-purple-600" />
                  Trend Bulanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="overdue"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Trend Efisiensi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      fill="#10b981"
                      stroke="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  Performa Sektor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="completed" fill="#10b981" />
                    <Bar dataKey="pending" fill="#f59e0b" />
                    <Bar dataKey="overdue" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-pink-600" />
                  Analisis Sektor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={sectorData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Completion Rate"
                      dataKey="completionRate"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Detail Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusData.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <Badge variant="secondary">{status.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Lihat Perizinan Pending
                  </Button>
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Perizinan Terlambat
                  </Button>
                  <Button className="w-full" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Perizinan Selesai
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
