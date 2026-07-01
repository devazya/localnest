/**
 * PostFormFields.jsx — Community module
 * Shared field primitives (FieldLabel, TextField, Toggle) and the
 * type-specific form-field groups used by CreatePostModal.
 * Only existing implementation moved — no logic changes.
 */

export function FieldLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{children}</div>;
}

export const fieldInputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12,
  fontSize: 14, color: '#0D0820', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export function TextField({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ ...fieldInputStyle, marginBottom: 12 }}
      onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
      <div onClick={() => onChange(!checked)} style={{ width: 38, height: 22, borderRadius: 999, background: checked ? '#6D4AFF' : '#E5E7EB', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2.5, left: checked ? 18 : 2.5, width: 17, height: 17, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
      </div>
      <span style={{ fontSize: 13, color: '#4B5563' }}>{label}</span>
    </label>
  );
}

export function RideOfferFields({ fields, setFields }) {
  return (
    <div>
      <FieldLabel>From (Pickup Location)</FieldLabel>
      <TextField value={fields.from || ''} onChange={v => setFields(f => ({ ...f, from: v }))} placeholder="e.g. Green Sector" />
      <FieldLabel>To (Drop Location)</FieldLabel>
      <TextField value={fields.to || ''} onChange={v => setFields(f => ({ ...f, to: v }))} placeholder="e.g. MG Road" />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Date</FieldLabel>
          <TextField type="date" value={fields.date || ''} onChange={v => setFields(f => ({ ...f, date: v }))} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Time</FieldLabel>
          <TextField type="time" value={fields.time || ''} onChange={v => setFields(f => ({ ...f, time: v }))} />
        </div>
      </div>
      <FieldLabel>Available Seats</FieldLabel>
      <TextField type="number" value={fields.seats || ''} onChange={v => setFields(f => ({ ...f, seats: v }))} placeholder="e.g. 3" />
      <FieldLabel>Price (Free / ₹ / Custom)</FieldLabel>
      <TextField value={fields.price || ''} onChange={v => setFields(f => ({ ...f, price: v }))} placeholder="Free or amount" />
      <FieldLabel>Vehicle (Bike / Car)</FieldLabel>
      <TextField value={fields.vehicle || ''} onChange={v => setFields(f => ({ ...f, vehicle: v }))} placeholder="e.g. Car" />
      <Toggle checked={!!fields.womenOnly} onChange={v => setFields(f => ({ ...f, womenOnly: v }))} label="Women Only" />
      <Toggle checked={!!fields.smokingAllowed} onChange={v => setFields(f => ({ ...f, smokingAllowed: v }))} label="Smoking Allowed" />
    </div>
  );
}

export function RideRequestFields({ fields, setFields }) {
  return (
    <div>
      <FieldLabel>From</FieldLabel>
      <TextField value={fields.from || ''} onChange={v => setFields(f => ({ ...f, from: v }))} placeholder="Pickup point" />
      <FieldLabel>To</FieldLabel>
      <TextField value={fields.to || ''} onChange={v => setFields(f => ({ ...f, to: v }))} placeholder="Drop point" />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Date</FieldLabel>
          <TextField type="date" value={fields.date || ''} onChange={v => setFields(f => ({ ...f, date: v }))} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Time</FieldLabel>
          <TextField type="time" value={fields.time || ''} onChange={v => setFields(f => ({ ...f, time: v }))} />
        </div>
      </div>
      <Toggle checked={!!fields.flexibleTiming} onChange={v => setFields(f => ({ ...f, flexibleTiming: v }))} label="Flexible Timing" />
    </div>
  );
}

export function EventFields({ fields, setFields }) {
  return (
    <div>
      <FieldLabel>Venue</FieldLabel>
      <TextField value={fields.venue || ''} onChange={v => setFields(f => ({ ...f, venue: v }))} placeholder="e.g. Community Hall" />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Date</FieldLabel>
          <TextField type="date" value={fields.date || ''} onChange={v => setFields(f => ({ ...f, date: v }))} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Time</FieldLabel>
          <TextField type="time" value={fields.time || ''} onChange={v => setFields(f => ({ ...f, time: v }))} />
        </div>
      </div>
      <FieldLabel>Entry Fee (Free / Paid)</FieldLabel>
      <TextField value={fields.entryFee || ''} onChange={v => setFields(f => ({ ...f, entryFee: v }))} placeholder="Free or amount" />
      <FieldLabel>Max Participants</FieldLabel>
      <TextField type="number" value={fields.maxParticipants || ''} onChange={v => setFields(f => ({ ...f, maxParticipants: v }))} placeholder="Leave blank for unlimited" />
    </div>
  );
}

export function BuySellFields({ fields, setFields }) {
  return (
    <div>
      <FieldLabel>Price</FieldLabel>
      <TextField type="number" value={fields.price || ''} onChange={v => setFields(f => ({ ...f, price: v }))} placeholder="₹ amount" />
      <FieldLabel>Condition</FieldLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['New', 'Like New', 'Good', 'Fair', 'Poor'].map(c => (
          <button key={c} type="button" onClick={() => setFields(f => ({ ...f, condition: c }))}
            style={{ padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: fields.condition === c ? 700 : 500, border: fields.condition === c ? '1.5px solid #6D4AFF' : '1.5px solid #E5E7EB', background: fields.condition === c ? '#F3F0FF' : '#fff', color: fields.condition === c ? '#6D4AFF' : '#6B7280', cursor: 'pointer' }}>
            {c}
          </button>
        ))}
      </div>
      <Toggle checked={!!fields.negotiable} onChange={v => setFields(f => ({ ...f, negotiable: v }))} label="Price Negotiable" />
    </div>
  );
}

export function PollFields({ fields, setFields }) {
  const options = fields.options || ['', ''];
  const setOption = (i, v) => {
    const next = [...options]; next[i] = v;
    setFields(f => ({ ...f, options: next }));
  };
  const addOption = () => setFields(f => ({ ...f, options: [...(f.options || ['', '']), ''] }));
  const removeOption = (i) => setFields(f => ({ ...f, options: options.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <FieldLabel>Poll Options (min 2)</FieldLabel>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`}
            style={{ ...fieldInputStyle, flex: 1, marginBottom: 0 }}
            onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
          {options.length > 2 && (
            <button type="button" onClick={() => removeOption(i)} style={{ width: 40, height: 44, borderRadius: 12, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>×</button>
          )}
        </div>
      ))}
      <button type="button" onClick={addOption} style={{ width: '100%', padding: '10px 0', borderRadius: 12, border: '1.5px dashed #C4B5FD', background: '#FAFAFF', color: '#6D4AFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}>+ Add Option</button>
      <Toggle checked={!!fields.allowMultiple} onChange={v => setFields(f => ({ ...f, allowMultiple: v }))} label="Allow Multiple Answers" />
      <Toggle checked={!!fields.anonymousVotes} onChange={v => setFields(f => ({ ...f, anonymousVotes: v }))} label="Anonymous Votes" />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Closes On (optional)</FieldLabel>
          <TextField type="date" value={fields.closeDate || ''} onChange={v => setFields(f => ({ ...f, closeDate: v }))} />
        </div>
      </div>
    </div>
  );
}

export function AnnouncementFields({ fields, setFields }) {
  return (
    <div>
      <FieldLabel>Badge</FieldLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['Official', 'Offer', 'Update', 'Utility Update'].map(b => (
          <button key={b} type="button" onClick={() => setFields(f => ({ ...f, badge: b }))}
            style={{ padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: fields.badge === b ? 700 : 500, border: fields.badge === b ? '1.5px solid #6D4AFF' : '1.5px solid #E5E7EB', background: fields.badge === b ? '#F3F0FF' : '#fff', color: fields.badge === b ? '#6D4AFF' : '#6B7280', cursor: 'pointer' }}>
            {b}
          </button>
        ))}
      </div>
      <Toggle checked={!!fields.pinned} onChange={v => setFields(f => ({ ...f, pinned: v }))} label="Pin to top" />
    </div>
  );
}
