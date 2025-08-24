import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <p className="text-xl mt-2">Page Not Found</p>
      <p className="text-slate-500 mt-1">The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="btn btn-primary mt-4">
        Go Back Home
      </Link>
    </div>
  );
}
