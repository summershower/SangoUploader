import { Outlet } from 'umi';
export default function Layout() {
  return (
    <div className="bg-gray-100 min-h-screen min-w-full overflow-x-hidden">
      <Outlet />
    </div>
  );
}
