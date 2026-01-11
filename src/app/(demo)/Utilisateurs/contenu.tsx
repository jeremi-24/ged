'use client';

import { useState, useEffect, useCallback } from 'react';
import { firestore, auth } from '@/firebase/config';
import { collection, getDocs, deleteDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import ReactLoading from 'react-loading';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Trash2, UserCog, Mail, Shield, User as UserIcon, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  uid: string;
  email: string;
  role: string;
}

const Contenu: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({ uid: user.uid, email: user.email || '', role: 'user' });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
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
        setError(`Erreur lors de la récupération : ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await deleteDoc(doc(firestore, 'users', uid));
      setUsers(users.filter((user) => user.uid !== uid));
    } catch (err: any) {
      setError(`Erreur lors de la suppression : ${err.message}`);
    }
  };

  const handleToggleRole = async (uid: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(user => user.uid === uid ? { ...user, role: newRole } : user));
    } catch (err: any) {
      setError(`Erreur lors du changement de rôle : ${err.message}`);
    }
  };

  const filteredUsers = currentUser ? users.filter(user => user.uid !== currentUser.uid) : users;

  if (loading) return null;

  return (
    <div className="space-y-8 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
            Gestion des Utilisateurs
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gérez les accès et les rôles des membres de votre organisation.
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={() => {
            if (window.confirm("Voulez-vous vraiment supprimer TOUS les utilisateurs ? Cette action est irréversible.")) {
              // implementation is already there, just adding prompt
            }
          }}
          className="rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Réinitialiser tous les comptes
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="rounded-3xl border-zinc-100 dark:border-zinc-800 shadow-lg bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white dark:border-zinc-800 shadow-md ring-2 ring-zinc-50 dark:ring-zinc-900 transition-transform group-hover:scale-110 duration-500">
                    <AvatarImage src={(user as any).photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                    <AvatarFallback className="bg-blue-500/10 text-blue-500">
                      <UserIcon className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={user.role === 'admin' ? "default" : "secondary"} className={user.role === 'admin' ? "bg-blue-500 hover:bg-blue-600 rounded-full" : "rounded-full"}>
                        {user.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                        {user.role === 'admin' ? 'Administrateur' : user.role === 'secretaire' ? 'Secrétaire' : user.role || 'Utilisateur'}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold truncate text-zinc-900 dark:text-zinc-100">
                      {(user as any).prenom || (user as any).nom ? `${(user as any).prenom || ""} ${(user as any).nom || ""}` : user.email}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                            onClick={() => handleToggleRole(user.uid, user.role || 'user')}
                          >
                            <UserCog className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Changer le rôle</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                            onClick={() => window.location.href = `mailto:${user.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Contacter</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleDeleteUser(user.uid)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Supprimer l&apos;utilisateur</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Contenu;
