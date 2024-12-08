'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/firebase/config';
import { collection, getDocs, deleteDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import ReactLoading from 'react-loading';
import { getAuth } from 'firebase/auth'; // Importation de Firebase Authentication

interface User {
  uid: string;
  email: string;
  role: string;
}

const Contenu: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'utilisateur actuel (authentifié)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({ uid: user.uid, email: user.email || '', role: 'user' }); // Adapter selon vos données
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup de l'abonnement lorsque le composant se démonte
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData: User[] = usersSnapshot.docs.map((doc) => ({
          ...doc.data() as User,
          uid: doc.id,
        }));
        setUsers(usersData);
      } catch (err: any) {
        setError(`Error fetching users: ${err.message}`);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (uid: string) => {
    setError(null);
    try {
      await deleteDoc(doc(firestore, 'users', uid));
      setUsers(users.filter((user) => user.uid !== uid));
    } catch (err: any) {
      setError(`Error deleting user: ${err.message}`);
      console.error('Error deleting user:', err);
    }
  };

  const handleDeleteAllUsers = async () => {
    setError(null);
    try {
      const batch = writeBatch(firestore);
      users.forEach((user) => {
        batch.delete(doc(firestore, 'users', user.uid));
      });
      await batch.commit();
      setUsers([]);
    } catch (err: any) {
      setError(`Error deleting all users: ${err.message}`);
      console.error('Error deleting all users:', err);
    }
  };

  const handleToggleRole = async (uid: string, currentRole: string) => {
    setError(null);
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      // Update the local state to reflect the role change
      setUsers(users.map(user => user.uid === uid ? { ...user, role: newRole } : user));
    } catch (err: any) {
      setError(`Error updating role: ${err.message}`);
      console.error('Error updating role:', err);
    }
  };

  if (loading) {
    return (
      <div></div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Filtrer les utilisateurs pour exclure l'utilisateur actuel
  const filteredUsers = currentUser ? users.filter(user => user.uid !== currentUser.uid) : users;

  return (
    <div>
      <Button onClick={handleDeleteAllUsers}>Supprimer tous les utilisateurs</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.uid)}
                >
                  Supprimer
                </Button>
                <Button
                  className={
                    user.role === 'admin'
                      ? 'bg-green-500 hover:bg-green-600 ml-8 text-white'
                      : 'bg-gray-400 hover:bg-gray-500 w-[75px] ml-8 text-white'
                  }
                  onClick={() => handleToggleRole(user.uid, user.role)}
                >
                  {user.role === 'admin' ? 'Admin' : 'secretaire'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Contenu;
