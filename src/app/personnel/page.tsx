
"use client"

import { useContext, useState, useCallback, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AuthContext, User, UserRole, ALL_ROLES } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { useI18n } from "@/context/i18n-context"
import type { TranslationKey } from "@/lib/locales"

function EditUserDialog({ user, onUpdate, onOpenChange, open }: { user: User; onUpdate: (id: string, name: string, role: UserRole, password?: string) => void, onOpenChange: (open: boolean) => void, open: boolean }) {
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState<UserRole>(user.role);
    const [password, setPassword] = useState("");
    const { t } = useI18n();

    useEffect(() => {
      if (user) {
        setName(user.name);
        setRole(user.role);
        setPassword(""); // Reset password field on open
      }
    }, [user]);

    const handleSave = () => {
        onUpdate(user.id, name, role, password || undefined);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('personnel_edit_title')}</DialogTitle>
                    <DialogDescription>
                        {t('personnel_edit_desc', { name: user.name })}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">{t('personnel_name_label')}</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-role">{t('personnel_role_label')}</Label>
                         <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                            <SelectTrigger id="edit-role">
                                <SelectValue placeholder={t('personnel_role_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {ALL_ROLES.map(r => (
                                    <SelectItem key={r} value={r}>{t(`role_${r}` as TranslationKey)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-password">{t('personnel_password_label')}</Label>
                        <Input
                            id="edit-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('personnel_password_placeholder_edit')}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('cancel')}</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>{t('save_changes')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function PersonnelPage() {
    const auth = useContext(AuthContext);
    const [newUserName, setNewUserName] = useState("");
    const [newUserRole, setNewUserRole] = useState<UserRole | "">("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { t } = useI18n();

    if (!auth || auth.isLoading) return null;
    const { users, addUser, deleteUser, updateUser, role, user: currentUser } = auth;

    const handleAddUser = useCallback(() => {
        if (newUserName && newUserRole && newUserPassword) {
            addUser(newUserName, newUserRole as UserRole, newUserPassword);
            setNewUserName("");
            setNewUserRole("");
            setNewUserPassword("");
        }
    }, [newUserName, newUserRole, newUserPassword, addUser]);

    const handleUpdateUser = useCallback((id: string, name: string, role: UserRole, password?: string) => {
       updateUser(id, name, role, password);
       setEditingUser(null);
    }, [updateUser]);
    
    const handleEditOpenChange = useCallback((isOpen: boolean) => {
        if (!isOpen) {
            setEditingUser(null);
        }
    }, []);

    if (role !== 'genel_mudur') {
        return (
            <AppLayout>
                <PageHeader title={t('unauthorized_title')} />
                <p>{t('unauthorized_desc')}</p>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <PageHeader title={t('personnel_title')} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 order-2 lg:order-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('personnel_current_title')}</CardTitle>
                            <CardDescription>{t('personnel_current_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('personnel_name_label')}</TableHead>
                                        <TableHead>{t('personnel_role_label')}</TableHead>
                                        <TableHead className="text-end">{t('table_actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell><Badge variant="secondary">{t(`role_${user.role}` as TranslationKey)}</Badge></TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                                                        {t('edit')}
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="icon" disabled={user.id === currentUser?.id}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('confirm_delete_personnel_desc', { name: user.name })}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteUser(user.id)}>
                                                                    {t('confirm_delete_yes')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                 <div className="order-1 lg:order-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('personnel_add_title')}</CardTitle>
                            <CardDescription>{t('personnel_add_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new-user-name">{t('personnel_name_label')}</Label>
                                <Input 
                                    id="new-user-name" 
                                    placeholder={t('personnel_name_placeholder')}
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="new-user-password">{t('personnel_password_label')}</Label>
                                <Input 
                                    id="new-user-password" 
                                    type="password"
                                    placeholder={t('personnel_password_placeholder_add')}
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-user-role">{t('personnel_role_label')}</Label>
                                <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole)}>
                                    <SelectTrigger id="new-user-role">
                                        <SelectValue placeholder={t('personnel_role_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALL_ROLES.map(r => (
                                            <SelectItem key={r} value={r}>{t(`role_${r}` as TranslationKey)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleAddUser} disabled={!newUserName || !newUserRole || !newUserPassword}>
                                {t('personnel_add_button')}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            {editingUser && (
                <EditUserDialog 
                    user={editingUser} 
                    onUpdate={handleUpdateUser} 
                    open={!!editingUser}
                    onOpenChange={handleEditOpenChange}
                />
            )}
        </AppLayout>
    )
}
