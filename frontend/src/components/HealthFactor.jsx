import React from 'react';
import { formatHealthFactor, getRiskInfo } from '../utils/helpers';
import { RISK_THRESHOLDS } from '../utils/constants';

export default function HealthFactor({ healthFactorRaw, hasDebt }) {
  const numericValue = hasDebt ? Number(formatHealthFactor(healthFactorRaw, hasDebt)) : Infinity;
  const risk = hasDebt ? getRiskInfo(numericValue) : getRiskInfo(RISK_THRESHOLDS.SAFE);
  const display = hasDebt ? formatHealthFactor(healthFactorRaw, hasDebt) : '∞';

  // Position the gauge fill: clamp displayed range to [0, 2.0] for the bar
  const clamped = hasDebt ? Math.min(Math.max(numericValue, 0), 2) : 2;
  const fillPercent = (clamped / 2) * 100;

  return (
    <div className="health-factor">
      <div className="health-factor__top">
        <span className="health-factor__label">Health Factor</span>
        <span className="risk-badge" style={{ color: risk.color, background: risk.bg }}>
          {risk.label}
        </span>
      </div>
      <div className="health-factor__value" style={{ color: risk.color }}>
        {display}
      </div>
      <div className="health-factor__bar">
        <div
          className="health-factor__bar-fill"
          style={{ width: `${fillPercent}%`, background: risk.color }}
        />
        <div className="health-factor__bar-marker" style={{ left: '50%' }} title="Liquidation at 1.0" />
      </div>
      <div className="health-factor__scale">
        <span>0</span>
        <span>1.0 liquidation</span>
        <span>2.0+</span>
      </div>
    </div>
  );
}