/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Database, Plus, RefreshCw, AlertTriangle, ShieldCheck, Thermometer, CalendarRange, Sliders } from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { stocks, replenishStock, addStockItem, updateStockThresholds, currentRole } = useApp();

  // Dialog & Form states
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [replenishQty, setReplenishQty] = useState<number>(50);

  // New stock item inputs
  const [newStock, setNewStock] = useState({
    name: '',
    manufacturer: '',
    batchNumber: '',
    dosesAvailable: 100,
    lowStockThreshold: 20,
    expiryDate: '',
    storageTemp: '2-8°C'
  });

  // Threshold edits states
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [tempThresholdValue, setTempThresholdValue] = useState<number>(0);

  // Submit and update replenishment
  const handleReplenish = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (replenishQty <= 0) return;
    replenishStock(id, replenishQty);
    setSelectedStockId(null);
  };

  // Submit configure vaccine line
  const handleAddNewStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.name || !newStock.manufacturer || !newStock.batchNumber || !newStock.expiryDate) {
      alert("Please solve all required fields.");
      return;
    }
    addStockItem(newStock);
    setIsAddingNew(false);
    // Reset
    setNewStock({
      name: '',
      manufacturer: '',
      batchNumber: '',
      dosesAvailable: 100,
      lowStockThreshold: 20,
      expiryDate: '',
      storageTemp: '2-8°C'
    });
  };

  const handleSaveThreshold = (id: string) => {
    if (tempThresholdValue < 0) return;
    updateStockThresholds(id, tempThresholdValue);
    setEditingThresholdId(null);
  };

  return (
    <div id="inventory-workspace" className="space-y-6">
      <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
            Pharmaceutical Stock & Cold Chain Monitor
          </h2>
          <p className="text-xs text-slate-500">
            Real-time tracking of vaccine storage temperatures, remaining doses, low-stock triggers, and batch credentials.
          </p>
        </div>

        {currentRole === 'Admin' && (
          <button
            id="btn-trigger-add-stock-modal"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center space-x-1 border border-transparent bg-teal-600 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Configure Stock Line</span>
          </button>
        )}
      </div>

      {/* Adding profile dialog modal form UI */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-slate-950 mb-1">
              Configure New Vaccine Stock Record
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Enter pharmaceutical specifications for cold-chain safety.
            </p>

            <form onSubmit={handleAddNewStock} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Vaccine / Formulation Name *</label>
                  <input
                    type="text"
                    required
                    value={newStock.name}
                    onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                    placeholder="COVID-19 (Moderna Spikevax)"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={newStock.manufacturer}
                    onChange={(e) => setNewStock({ ...newStock, manufacturer: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                    placeholder="Moderna Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Batch/Serial code *</label>
                  <input
                    type="text"
                    required
                    value={newStock.batchNumber}
                    onChange={(e) => setNewStock({ ...newStock, batchNumber: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 uppercase font-mono"
                    placeholder="MOD-9092"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Initial Doses</label>
                  <input
                    type="number"
                    value={newStock.dosesAvailable}
                    onChange={(e) => setNewStock({ ...newStock, dosesAvailable: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Alert Threshold</label>
                  <input
                    type="number"
                    value={newStock.lowStockThreshold}
                    onChange={(e) => setNewStock({ ...newStock, lowStockThreshold: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Refrigeration Profile</label>
                  <select
                    value={newStock.storageTemp}
                    onChange={(e) => setNewStock({ ...newStock, storageTemp: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700"
                  >
                    <option>2-8°C</option>
                    <option>-20°C to -15°C</option>
                    <option>-80°C to -60°C</option>
                    <option>Controlled Room Temp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Expiration date *</label>
                  <input
                    type="date"
                    required
                    value={newStock.expiryDate}
                    onChange={(e) => setNewStock({ ...newStock, expiryDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-850"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="rounded bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 hover:text-white transition"
                >
                  Configure Stack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock List Display */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stocks.map((item) => {
          const isLowStock = item.dosesAvailable <= item.lowStockThreshold;
          const isExpiringSoon = new Date(item.expiryDate).getTime() - new Date().getTime() < 180 * 24 * 60 * 60 * 1000; // less than 180 days

          return (
            <div 
              key={item.id} 
              className={`rounded-xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isLowStock ? 'border-amber-250 ring-1 ring-amber-500/10' : 'border-slate-150'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                      BATCH: {item.batchNumber}
                    </span>
                  </div>
                  <Database className={`h-4.5 w-4.5 ${isLowStock ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
                </div>

                <div className="h-px bg-slate-100 my-3"></div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Thermometer className="h-4 w-4 text-sky-500 shrink-0" />
                    <div>
                      <span className="text-[9.5px] text-slate-400 block font-medium">Temp Range</span>
                      <strong className="text-slate-850 font-semibold">{item.storageTemp}</strong>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    <CalendarRange className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[9.5px] text-slate-400 block font-medium">Expiration</span>
                      <strong className={`font-semibold ${isExpiringSoon ? 'text-amber-600' : 'text-slate-850'}`}>
                        {item.expiryDate}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100/60 text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-slate-500 font-medium">Refrigerated Stock:</span>
                    <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                      {item.dosesAvailable} doses
                    </span>
                  </div>

                  {/* Stock depletion slider bar */}
                  <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isLowStock ? 'bg-red-500' : 'bg-teal-500'}`}
                      style={{ width: `${Math.min(100, (item.dosesAvailable / (item.lowStockThreshold * 2.5)) * 100)}%` }}
                    ></div>
                  </div>

                  {/* Threshold trigger settings */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40 text-[10.5px]">
                    <span className="text-slate-400 font-medium">Trigger Alert Limit:</span>
                    {editingThresholdId === item.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={tempThresholdValue}
                          onChange={(e) => setTempThresholdValue(parseInt(e.target.value) || 0)}
                          className="w-12 border px-1 rounded text-center text-[10.5px]"
                        />
                        <button 
                          onClick={() => handleSaveThreshold(item.id)}
                          className="bg-teal-600 text-white rounded px-1 text-[9px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => {
                          if (currentRole !== 'Admin') {
                            alert("Duty Separation Constraint: Only system Administrators can alter low-stock safety thresholds.");
                            return;
                          }
                          setEditingThresholdId(item.id);
                          setTempThresholdValue(item.lowStockThreshold);
                        }}
                        className={`font-bold text-slate-600 underline ${currentRole === 'Admin' ? 'cursor-pointer hover:text-teal-600' : 'cursor-not-allowed'}`}
                        title={currentRole === 'Admin' ? "Click to redefine safe margins" : "Administrator permission required"}
                      >
                        {item.lowStockThreshold} doses
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Replenish operational buttons */}
              {currentRole !== 'Patient' && (
                <div className="mt-4 border-t border-slate-50 pt-3">
                  {selectedStockId === item.id ? (
                    <form onSubmit={(e) => handleReplenish(e, item.id)} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-1 flex-1">
                        <span className="text-[10px] text-slate-500">Add</span>
                        <input
                          type="number"
                          value={replenishQty}
                          onChange={(e) => setReplenishQty(parseInt(e.target.value) || 0)}
                          className="w-16 rounded border px-2 py-0.5 text-xs text-center"
                        />
                        <span className="text-[10px] text-slate-500">Doses</span>
                      </div>
                      <div className="space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedStockId(null)}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 text-slate-600"
                        >
                          X
                        </button>
                        <button
                          type="submit"
                          className="text-[10px] bg-teal-600 text-white hover:bg-teal-700 rounded px-2.5 py-1 font-semibold"
                        >
                          Commit
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      id={`replenish-btn-${item.id}`}
                      onClick={() => setSelectedStockId(item.id)}
                      className="w-full inline-flex items-center justify-center space-x-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 transition text-[11px] font-semibold rounded py-1.5"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Log Supply Replenishment</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
