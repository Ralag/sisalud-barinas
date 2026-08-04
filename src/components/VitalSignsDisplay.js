import { VITAL_RANGES } from '@/lib/utils/constants';

function getVitalStatus(type, value) {
    if (value === null || value === undefined) return 'none';
    const range = VITAL_RANGES[type];
    if (!range) return 'normal';
    if (value <= range.critical_low_below || value >= range.critical_high_above) return 'critical';
    if (value >= range.normal_min && value <= range.normal_max) return 'normal';
    return 'warning';
}

export default function VitalSignsDisplay({ vitals }) {
    if (!vitals) return null;

    const { blood_pressure_sys, blood_pressure_dia, heart_rate, temperature, weight, height, oxygen_sat } = vitals;

    const cards = [
        { key: 'blood_pressure', label: 'Presión Arterial', value: blood_pressure_sys && blood_pressure_dia ? `${blood_pressure_sys}/${blood_pressure_dia}` : null, unit: 'mmHg', icon: '🫀', statusType: 'blood_pressure_sys' },
        { key: 'heart_rate', label: 'Frec. Cardíaca', value: heart_rate, unit: 'bpm', icon: '❤️', statusType: 'heart_rate' },
        { key: 'temperature', label: 'Temperatura', value: temperature, unit: '°C', icon: '🌡️', statusType: 'temperature' },
        { key: 'weight', label: 'Peso', value: weight, unit: 'kg', icon: '⚖️', statusType: 'weight' },
        { key: 'height', label: 'Talla', value: height, unit: 'cm', icon: '📏', statusType: 'height' },
        { key: 'oxygen_sat', label: 'Saturación O₂', value: oxygen_sat, unit: '%', icon: '🫁', statusType: 'oxygen_sat' }
    ];

    return (
        <div className="vitals-grid">
            {cards.map(card => {
                const rawValue = card.statusType === 'blood_pressure_sys' ? blood_pressure_sys : vitals[card.statusType];
                const status = getVitalStatus(card.statusType, rawValue);
                
                return (
                    <div key={card.key} className={`vital-card vital-status-${status}`}>
                        <div className="vital-icon">{card.icon}</div>
                        <div className="vital-info">
                            <span className="vital-label">{card.label}</span>
                            <div className="vital-value-group">
                                <span className={card.value ? "vital-value" : "vital-value text-muted"}>
                                    {card.value || '--'}
                                </span>
                                <span className="vital-unit">{card.unit}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
