export default function VitalSignsInput({ defaultValues = {} }) {
    return (
        <div className="vitals-grid">
            <div className="vital-input-group">
                <label className="form-label" htmlFor="blood_pressure_sys">Presión Sistólica</label>
                <div className="input-with-unit">
                    <input type="number" id="blood_pressure_sys" name="blood_pressure_sys" className="form-input" min="0" max="300" step="1" defaultValue={defaultValues.blood_pressure_sys} />
                    <span className="unit-indicator">mmHg</span>
                </div>
            </div>
            
            <div className="vital-input-group">
                <label className="form-label" htmlFor="blood_pressure_dia">Presión Diastólica</label>
                <div className="input-with-unit">
                    <input type="number" id="blood_pressure_dia" name="blood_pressure_dia" className="form-input" min="0" max="200" step="1" defaultValue={defaultValues.blood_pressure_dia} />
                    <span className="unit-indicator">mmHg</span>
                </div>
            </div>

            <div className="vital-input-group">
                <label className="form-label" htmlFor="heart_rate">Frec. Cardíaca</label>
                <div className="input-with-unit">
                    <input type="number" id="heart_rate" name="heart_rate" className="form-input" min="0" max="300" step="1" defaultValue={defaultValues.heart_rate} />
                    <span className="unit-indicator">lpm</span>
                </div>
            </div>

            <div className="vital-input-group">
                <label className="form-label" htmlFor="temperature">Temperatura</label>
                <div className="input-with-unit">
                    <input type="number" id="temperature" name="temperature" className="form-input" min="30" max="45" step="0.1" defaultValue={defaultValues.temperature} />
                    <span className="unit-indicator">°C</span>
                </div>
            </div>

            <div className="vital-input-group">
                <label className="form-label" htmlFor="weight">Peso</label>
                <div className="input-with-unit">
                    <input type="number" id="weight" name="weight" className="form-input" min="0" max="500" step="0.1" defaultValue={defaultValues.weight} />
                    <span className="unit-indicator">kg</span>
                </div>
            </div>

            <div className="vital-input-group">
                <label className="form-label" htmlFor="height">Talla</label>
                <div className="input-with-unit">
                    <input type="number" id="height" name="height" className="form-input" min="0" max="300" step="1" defaultValue={defaultValues.height} />
                    <span className="unit-indicator">cm</span>
                </div>
            </div>

            <div className="vital-input-group">
                <label className="form-label" htmlFor="oxygen_sat">Saturación O₂</label>
                <div className="input-with-unit">
                    <input type="number" id="oxygen_sat" name="oxygen_sat" className="form-input" min="0" max="100" step="1" defaultValue={defaultValues.oxygen_sat} />
                    <span className="unit-indicator">%</span>
                </div>
            </div>
        </div>
    );
}
