import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Car, CheckCircle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  phone: string;
  vehicleNumber: string;
  registeredAt: string;
}

export function UserSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const currentVehicle = localStorage.getItem('currentVehicleNumber') || 'DEMO4774';
  const currentUserName = localStorage.getItem('currentUserName') || 'Demo User';

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const switchUser = (user: User) => {
    localStorage.setItem('currentVehicleNumber', user.vehicleNumber);
    localStorage.setItem('currentUserName', user.name);
    
    // Refresh all wallet-related queries
    queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
    
    // Close switcher and refresh page
    setIsOpen(false);
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Users className="h-4 w-4" />
        <span>{currentUserName}</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Switch User</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users?.map((user) => (
            <div 
              key={user.id}
              onClick={() => switchUser(user)}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                user.vehicleNumber === currentVehicle 
                  ? 'bg-green-50 border-green-200' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  {user.vehicleNumber === currentVehicle && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Car className="h-3 w-3" />
                  <span>{user.vehicleNumber}</span>
                </div>
              </div>
              
              {user.vehicleNumber === currentVehicle && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              )}
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full mt-4"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}