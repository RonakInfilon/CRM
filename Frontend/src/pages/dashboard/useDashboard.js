import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { getDashboardData } from "./dashboardService";

export const useDashboard = () => {
  const navigate = useNavigate();
  const { isEmployee } = useRole();

  const [totalLeads, setTotalLeads] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [winRate, setWinRate] = useState("0.0%");
  const [companiesCount, setCompaniesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acquisitionTrend, setAcquisitionTrend] = useState({ categories: [], data: [] });
  const [distribution, setDistribution] = useState({ labels: [], series: [] });
  const [recentActivities, setRecentActivities] = useState([]);
  const [conversion, setConversion] = useState({
    totalBaseline: 0,
    qualifiedLeadsCount: 0,
    qualifiedPercentage: 0,
    wonDealsCount: 0,
    convertedPercentage: 0
  });

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "yesterday";
    return `${diffDays} days ago`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardData();
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setTotalLeads(d.totalLeads);
          setPipelineValue(d.pipelineValue);
          setWinRate(d.winRate);
          setCompaniesCount(d.companiesCount);
          setAcquisitionTrend(d.leadAcquisitionTrend || { categories: [], data: [] });
          setDistribution(d.leadDistribution || { labels: [], series: [] });
          setRecentActivities(d.recentActivities || []);
          setConversion(d.lifecycleConversion || {
            totalBaseline: 0,
            qualifiedLeadsCount: 0,
            qualifiedPercentage: 0,
            wonDealsCount: 0,
            convertedPercentage: 0
          });
        }
      } catch (err) {
        console.warn("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    navigate,
    isEmployee,
    totalLeads,
    pipelineValue,
    winRate,
    companiesCount,
    loading,
    acquisitionTrend,
    distribution,
    recentActivities,
    conversion,
    getRelativeTime,
  };
};
