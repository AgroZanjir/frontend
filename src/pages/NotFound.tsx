import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">
        Nothing at{" "}
        <code className="font-mono text-sm">{location.pathname}</code>
      </p>
      <Link to="/panels" className="text-primary underline underline-offset-4">
        Back to the panels
      </Link>
    </div>
  );
};

export default NotFound;
