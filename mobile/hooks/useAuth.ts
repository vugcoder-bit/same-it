import { useMutation } from '@tanstack/react-query';
import { loginApi, registerApi, LoginPayload } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: (data: LoginPayload) => loginApi(data),
        onSuccess: (data) => {
            const user = { ...data.user, id: Number(data.user.id), role: (data.role || 'USER') } as any;
            setAuth(data.token, user);
        },
    });
};

export const useRegister = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: (data: any) => registerApi(data),
        onSuccess: (data) => {
            const user = { ...data.user, id: Number(data.user.id), role: (data.role || 'USER') } as any;
            setAuth(data.token, user);
        },
    });
};
