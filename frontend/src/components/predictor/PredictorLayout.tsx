import { Outlet } from 'react-router-dom';

export const PredictorLayout = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8">
      <Outlet />
    </div>
  );
};
