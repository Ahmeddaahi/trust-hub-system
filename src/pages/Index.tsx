
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl font-bold mb-4 text-blue-900">Secure Authentication System</h1>
        <p className="text-xl text-gray-700 mb-8">
          A complete JWT-based authentication system with secure login, registration, and token management
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Button 
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Login
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/register")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Register
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-blue-800">Secure Authentication</h2>
            <p className="text-gray-600">
              JWT-based authentication with refresh tokens and secure password handling using bcrypt
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-blue-800">Protected Routes</h2>
            <p className="text-gray-600">
              Role-based authorization system with middleware protection for your API routes
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-blue-800">Easy Integration</h2>
            <p className="text-gray-600">
              Clean code structure that's easy to extend with additional features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
