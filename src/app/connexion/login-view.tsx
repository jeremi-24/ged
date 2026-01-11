import Link from 'next/link';
import UserAuthForm from './login-auth-form';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function LoginViewPage() {
    return (
        <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/inscription"
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'absolute right-4 top-4 hidden md:right-8 md:top-8'
                )}
            >
                Inscription
            </Link>
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href="/" className="relative z-20 flex items-center gap-2 group text-white">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:rotate-6 transition-transform">
                        Y
                    </div>
                    <span className="text-2xl font-bold tracking-tight">
                        YunoDoc
                    </span>
                </Link>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            Simplifiez la gestion de vos documents avec notre solution intelligente.
                        </p>
                        <footer className="text-sm">L&apos;équipe GED</footer>
                    </blockquote>
                </div>
            </div>
            <div className="flex h-full items-center p-4 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <UserAuthForm />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Vous n&apos;avez pas encore de compte?{' '}
                        <Link
                            href="/inscription"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Inscrivez-vous
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
