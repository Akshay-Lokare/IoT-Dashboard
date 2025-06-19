import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function DeviceTimelineGraph() {

  const user = useSelector((state) => state.user);

  const [graphData, setGraphData] = useState([]);

  const decodePayload = (payload) => {
    const battery_hex = payload.slice(4, 8);
    const motion_hex = payload.slice(8);
    return {
      battery: parseInt(battery_hex, 16),
      motionCount: parseInt(motion_hex, 16)
    };
  };

  useEffect(() => {
    const fetchMotionData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/motion/all?email=${user.email}`);
        const data = await res.json();
        const processed = data.map((entry, index) => {
          const { battery, motionCount } = decodePayload(entry.payload);
          return {
            id: index + 1,
            payload: entry.payload,
            createDate: new Date(entry.createDate).toLocaleString(),
            battery,
            motionCount
          };
        });
        setGraphData(processed);
      } catch (error) {
        console.error('❌ Error:', error);
      }
    };

    if (user.email) {
      fetchMotionData();
    }
  }, [user.email]);


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          fontSize: '14px',
          color: '#1f2937',
          fontFamily: 'Inter, sans-serif',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div><strong style={{ color: '#3b82f6' }}>Date:</strong> {data.createDate}</div>
          <div><strong style={{ color: '#10b981' }}>Battery:</strong> {data.battery}%</div>
          <div><strong style={{ color: '#f59e0b' }}>Motion:</strong> {data.motionCount}</div>
          <div><strong style={{ color: '#ef4444' }}>Payload:</strong> {data.payload}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: 'linear-gradient(to bottom,rgb(248, 252, 249), rgb(185, 248, 201))',
      borderRadius: '1.25rem',
      padding: '2rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      maxWidth: '1000px',
      margin: '3rem auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h2 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        📈 Motion Events Timeline
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={graphData} margin={{ top: 20, right: 30, bottom: 10, left: 10 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="id"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#94a3b8' }}
            tickLine={false}
            label={{
              value: 'Events',
              position: 'insideBottom',
              offset: -5,
              fill: '#64748b',
              fontSize: 13
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="motionCount"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{
              stroke: '#14b8a6',
              strokeWidth: 2,
              fill: '#ccfbf1',
              r: 5
            }}
            activeDot={{
              r: 7,
              fill: '#e0f2fe',
              stroke: '#0ea5e9',
              strokeWidth: 3
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
