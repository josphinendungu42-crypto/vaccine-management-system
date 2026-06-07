/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from './AppContext';
import { Users, Syringe, Calendar, Database, AlertCircle, TrendingUp, ShieldAlert, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { patients, stocks, appointments, administrations, aefiReports, atError, setAtError, settings, updateSettings } = useApp();

  const [localAtUsername, setLocalAtUsername] = React.useState(settings.atUsername || '');
  const [localAtApiKey, setLocalAtApiKey] = React.useState(settings.atApiKey || '');
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    setLocalAtUsername(settings.atUsername || '');
    setLocalAtApiKey(settings.atApiKey || '');
  }, [settings.atUsername, settings.atApiKey]);

  const handleQuickSaveAt = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      atUsername: localAtUsername.trim(),
      atApiKey: localAtApiKey.trim()
    });
    setAtError(null);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleResetAtDefault = () => {
    const defaultUser = 'sandbox';
    const defaultKey = 'atsk_60e40e7bc707cdb83f18accd452d3d088db5071581db8a3b2c955bc851de172625290db0';
    setLocalAtUsername(defaultUser);
    setLocalAtApiKey(defaultKey);
    updateSettings({
      ...settings,
      atUsername: defaultUser,
      atApiKey: defaultKey
    });
    setAtError(null);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  // Low stock inventory items
  const lowStockItems = stocks.filter(item => item.dosesAvailable <= item.lowStockThreshold);

  // Stats derivation
  const totalPatients = patients.length;
  const totalDosesAdministered = administrations.length;
  const pendingAppointments = appointments.filter(a => a.status === 'Scheduled').length;
  const totalDosesRemaining = stocks.reduce((acc, curr) => acc + curr.dosesAvailable, 0);

  // Prepare chart data for coverage by vaccine category
  // Doses Administered vs Doses Available
  const coverageData = stocks.map(stock => {
    const administeredCount = administrations.filter(adm => adm.vaccineType === stock.name).length;
    return {
      name: stock.name.split(' ')[0], // short name
      fullName: stock.name,
      'Administered Doses': administeredCount,
      'Available Doses': stock.dosesAvailable,
    };
  });

  // AEFI severity breakdown chart data
  const mildAEFI = aefiReports.filter(r => r.symptomSeverity === 'Mild').length;
  const moderateAEFI = aefiReports.filter(r => r.symptomSeverity === 'Moderate').length;
  const severeAEFI = aefiReports.filter(r => r.symptomSeverity === 'Severe').length;

  const aefiChartData = [
    { name: 'Mild Reactions', value: mildAEFI, color: '#14b8a6' },
    { name: 'Moderate Reactions', value: moderateAEFI, color: '#f59e0b' },
    { name: 'Severe Reports', value: severeAEFI, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Defaults if no records exist yet
  const hasAEFI = aefiChartData.length > 0;

  return (
    <div id="dashboard-tab-view" className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            National Immunization Coverage Console
          </h2>
          <p className="text-sm text-slate-500">
            Real-time visual monitoring of clinical operations, immunization rates, and inventory alerts.
          </p>
        </div>
        <div className="flex space-x-2">
          <span className="inline-flex items-center space-x-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-600/20">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span>FHIR Compliant Integration</span>
          </span>
        </div>
      </div>

      {/* Africa's Talking Credentials Action Banner */}
      {atError && (
        <div id="at-critical-unauthorized-alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start space-x-3.5">
            <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-rose-950 uppercase tracking-wider">
                SMS Communication Gateway Error (401 Unauthorized)
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed font-semibold">
                Your registered credentials for Africa's Talking are invalid or declined by the wireless network. Let's fix this error completely right here:
              </p>
              <p className="text-[10.5px] text-rose-900/80 font-mono bg-white/70 py-1.5 px-3 rounded-lg border border-rose-150 mt-1 max-w-xl">
                Diagnostic Output: {atError}
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickSaveAt} className="bg-white/80 rounded-xl p-4 border border-rose-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">AT Username</label>
              <input
                type="text"
                value={localAtUsername}
                onChange={(e) => setLocalAtUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-350 px-3 py-2 text-xs text-slate-850 bg-white font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">AT API Key</label>
              <input
                type="text"
                value={localAtApiKey}
                onChange={(e) => setLocalAtApiKey(e.target.value)}
                className="w-full rounded-lg border border-slate-355 px-3 py-2 text-xs text-slate-850 bg-white font-mono"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3 py-2 text-xs font-bold transition duration-150 cursor-pointer text-center shadow-xs"
              >
                Apply Credentials
              </button>
              <button
                type="button"
                onClick={handleResetAtDefault}
                className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-3 py-2 text-xs font-bold transition duration-150 cursor-pointer text-center shadow-xs"
                title="Fill default trial settings"
              >
                Reset Default Key
              </button>
            </div>
          </form>

          {savedSuccess && (
            <div className="text-[10.5px] font-bold text-emerald-700 animate-pulse">
              ✓ Credentials saved and settings synced! Please try to book an appointment or re-trigger SMS notification.
            </div>
          )}
        </div>
      )}

      {/* Numerical Tiles Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Patients */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered Patients
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-950">{totalPatients}</p>
          <div className="mt-2 flex items-center space-x-1 text-xs text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-emerald-600">Active</span>
            <span>demographic registry</span>
          </div>
        </div>

        {/* Total Administered */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Administered Doses
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Syringe className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-950">{totalDosesAdministered}</p>
          <div className="mt-2 flex items-center space-x-1 text-xs text-slate-500">
            <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              100% Correct Tracked
            </span>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Appointments
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-950">{pendingAppointments}</p>
          <div className="mt-2 flex items-center space-x-1 text-xs text-slate-500">
            <span>Schedules up to 2 weeks out</span>
          </div>
        </div>

        {/* Total Available Stocks */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Stocks (Doses)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-950">{totalDosesRemaining}</p>
          <div className="mt-2 text-xs">
            {lowStockItems.length > 0 ? (
              <span className="inline-flex items-center space-x-1 font-semibold text-red-600 animate-pulse">
                <AlertCircle className="h-3 w-3" />
                <span>{lowStockItems.length} Low Stock Lines</span>
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Stock levels secure</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts Box (Component 4: Inventory Alert) */}
      {lowStockItems.length > 0 && (
        <div id="low-stock-critical-alert" className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">
                Critical Inventory Level Alerts
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                The vaccine formulations listed below have drifted below their designated safe clinical thresholds.
                Prepare emergency replenishment or shift clinic calendars to prevent stock outs!
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-amber-200 bg-white p-2.5 shadow-2xs">
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <div className="mt-1 flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">Stock Balance:</span>
                      <span className="font-bold text-red-600">{item.dosesAvailable} doses</span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px] text-slate-400">
                      <span>Threshold limit:</span>
                      <span>{item.lowStockThreshold} doses</span>
                    </div>
                    <div className="mt-2 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (item.dosesAvailable / item.lowStockThreshold) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coverage Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 md:text-base">
                Immunization Stock Coverage Ratio
              </h3>
              <p className="text-xs text-slate-500">
                Evaluating doses given of each formulation relative to remaining inventory reserves.
              </p>
            </div>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              Live Logistics Sync
            </span>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={coverageData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Administered Doses" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available Doses" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AEFI Safety Breakdown & Details */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 md:text-base">
                  Post-Vaccination Safety (AEFI)
                </h3>
                <p className="text-xs text-slate-500">
                  Adverse Event reports received per severity rating index.
                </p>
              </div>
              <ShieldAlert className="h-4.5 w-4.5 text-slate-400" />
            </div>

            {hasAEFI ? (
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={aefiChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {aefiChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Labels legend */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {aefiChartData.map((item, id) => (
                    <div key={id} className="p-1 rounded bg-slate-50 border border-slate-100">
                      <p className="font-bold" style={{ color: item.color }}>{item.value}</p>
                      <span className="text-[10px] text-slate-500 font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200 h-64">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-xs font-semibold text-slate-800">No Incidents Reported</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Perfect patient safety indicators. No adverse clinical events recorded within active session scope.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
              Urgent Safety Protocol Action
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If severe anaphylaxis or fever occurs, log records inside 
              the <strong>Clinical Operations Menu</strong>. The Admin log monitors the compliance timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
