
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    let greetingText = '';
    
    if (hours < 12) {
      greetingText = 'Good morning';
    } else if (hours < 18) {
      greetingText = 'Good afternoon';
    } else {
      greetingText = 'Good evening';
    }
    
    setGreeting(greetingText);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {greeting}, {user?.name}!
          </p>
        </div>
        <Button variant="outline" onClick={logout} className="mt-4 md:mt-0">
          <LogOut size={16} className="mr-2" /> Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User size={18} className="mr-2" /> Your Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Name:</span> {user?.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-semibold">Role:</span> {user?.role}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Edit Profile
            </Button>
          </CardFooter>
        </Card>

        {/* More cards can be added here for dashboard content */}
      </div>
    </div>
  );
}
