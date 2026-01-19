import { 
  onAuthStateChanged, 
  type User,
  type Unsubscribe 
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Function để theo dõi trạng thái đăng nhập
 * Chỉ dùng trong client components (gọi trong useEffect)
 */
export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  if (typeof window === 'undefined') {
    // Server-side: return no-op unsubscribe
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
}

/**
 * Kiểm tra xem user có phải là admin được phép không
 */
export function isAuthorizedUser(user: User | null): boolean {
  if (!user || !user.email) return false;
  
  const authorizedEmails = ['phanminhdai.it@gmail.com'];
  return authorizedEmails.includes(user.email.toLowerCase());
}

