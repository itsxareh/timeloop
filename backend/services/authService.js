// services/authService.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';

class AuthService {
  
  // Register new user
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Sync with your PostgreSQL database
      await this.syncUserWithDatabase(user, displayName);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Sign in user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Sign in with Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Sync with your database on first login
      await this.syncUserWithDatabase(user, user.displayName);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Sign out user
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Update user profile
  async updateUserProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      await updateProfile(user, updates);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
  
  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
  
  // Get user token for API calls
  async getUserToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
  
  // Sync Firebase user with PostgreSQL database
  async syncUserWithDatabase(firebaseUser, displayName) {
    try {
      const userData = {
        firebase_uid: firebaseUser.uid,
        username: displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        profile_image: firebaseUser.photoURL
      };
      
      // Call your API to create/update user in PostgreSQL
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync user with database');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error syncing user with database:', error);
      // Don't throw error - allow user to continue even if sync fails
    }
  }
  
  // Handle Firebase auth errors
  handleAuthError(error) {
    let message = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No user found with this email address';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'Email address is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message;
    }
    
    return new Error(message);
  }
}

export default new AuthService();