
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';

class FirestoreService {
  
  // Real-time notifications
  async createNotification(userId, notification) {
    try {
      const notificationData = {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type, // 'capsule_unlocked', 'goal_progress', 'shared_capsule'
        read: false,
        createdAt: serverTimestamp(),
        data: notification.data || {}
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }
  
  // Listen to user notifications
  subscribeToNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      callback(notifications);
    });
  }
  
  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }
  
  // Real-time goal progress tracking
  async updateGoalProgress(goalId, userId, progressData) {
    try {
      const progressRef = doc(db, 'goalProgress', goalId);
      const progressUpdate = {
        goalId,
        userId,
        progress: progressData.progress,
        notes: progressData.notes,
        timestamp: serverTimestamp(),
        milestones: progressData.milestones || []
      };
      
      await updateDoc(progressRef, progressUpdate);
      return progressUpdate;
    } catch (error) {
      // Document doesn't exist, create it
      if (error.code === 'not-found') {
        const docRef = await addDoc(collection(db, 'goalProgress'), {
          goalId,
          userId,
          progress: progressData.progress,
          notes: progressData.notes,
          timestamp: serverTimestamp(),
          milestones: progressData.milestones || [],
          createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...progressData };
      }
      throw new Error(`Failed to update goal progress: ${error.message}`);
    }
  }
  
  // Subscribe to goal progress updates
  subscribeToGoalProgress(goalId, callback) {
    const progressRef = doc(db, 'goalProgress', goalId);
    
    return onSnapshot(progressRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }
  
  // Shared capsule collaboration
  async shareTimeCapsule(capsuleId, sharedWith, sharedBy) {
    try {
      const sharedCapsuleData = {
        capsuleId,
        sharedWith, // array of user IDs
        sharedBy,
        sharedAt: serverTimestamp(),
        status: 'active',
        collaborators: [sharedBy, ...sharedWith],
        comments: [],
        reactions: {}
      };
      
      const docRef = await addDoc(collection(db, 'sharedCapsules'), sharedCapsuleData);
      
      // Create notifications for shared users
      for (const userId of sharedWith) {
        await this.createNotification(userId, {
          title: 'Time Capsule Shared',
          message: 'Someone shared a time capsule with you!',
          type: 'shared_capsule',
          data: { capsuleId, sharedBy }
        });
      }
      
      return { id: docRef.id, ...sharedCapsuleData };
    } catch (error) {
      throw new Error(`Failed to share capsule: ${error.message}`);
    }
  }
  
  // Add comment to shared capsule
  async addCapsuleComment(sharedCapsuleId, userId, comment) {
    try {
      const sharedCapsuleRef = doc(db, 'sharedCapsules', sharedCapsuleId);
      const commentData = {
        userId,
        comment,
        timestamp: serverTimestamp(),
        id: Date.now().toString()
      };
      
      await updateDoc(sharedCapsuleRef, {
        comments: arrayUnion(commentData)
      });
      
      return commentData;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }
  
  // Subscribe to shared capsule updates
  subscribeToSharedCapsule(sharedCapsuleId, callback) {
    const sharedCapsuleRef = doc(db, 'sharedCapsules', sharedCapsuleId);
    
    return onSnapshot(sharedCapsuleRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }
  
  // Real-time chat for future mail
  async sendFutureMessage(fromUserId, toUserId, message) {
    try {
      const messageData = {
        fromUserId,
        toUserId,
        message,
        timestamp: serverTimestamp(),
        read: false,
        type: 'future_message'
      };
      
      const docRef = await addDoc(collection(db, 'futureMessages'), messageData);
      
      // Create notification for recipient
      await this.createNotification(toUserId, {
        title: 'New Future Message',
        message: 'You received a message from the future!',
        type: 'future_message',
        data: { messageId: docRef.id, fromUserId }
      });
      
      return { id: docRef.id, ...messageData };
    } catch (error) {
      throw new Error(`Failed to send future message: ${error.message}`);
    }
  }
  
  // Subscribe to future messages
  subscribeToFutureMessages(userId, callback) {
    const q = query(
      collection(db, 'futureMessages'),
      where('toUserId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    });
  }
  
  // User presence tracking
  async updateUserPresence(userId, isOnline = true) {
    try {
      const userPresenceRef = doc(db, 'userPresence', userId);
      await updateDoc(userPresenceRef, {
        isOnline,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      // Document doesn't exist, create it
      if (error.code === 'not-found') {
        await addDoc(collection(db, 'userPresence'), {
          userId,
          isOnline,
          lastSeen: serverTimestamp()
        });
      }
    }
  }
  
  // Subscribe to user presence
  subscribeToUserPresence(userIds, callback) {
    const q = query(
      collection(db, 'userPresence'),
      where('userId', 'in', userIds)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const presence = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        presence[data.userId] = {
          isOnline: data.isOnline,
          lastSeen: data.lastSeen
        };
      });
      callback(presence);
    });
  }
  
  // Activity feed
  async addActivity(userId, activity) {
    try {
      const activityData = {
        userId,
        type: activity.type, // 'capsule_created', 'goal_completed', etc.
        title: activity.title,
        description: activity.description,
        timestamp: serverTimestamp(),
        data: activity.data || {}
      };
      
      const docRef = await addDoc(collection(db, 'activities'), activityData);
      return { id: docRef.id, ...activityData };
    } catch (error) {
      throw new Error(`Failed to add activity: ${error.message}`);
    }
  }
  
    // Get user's activity feed
    subscribeToActivityFeed(userId, callback) {
        const q = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
        );

        return onSnapshot(q, (querySnapshot) => {
        const activities = [];
        querySnapshot.forEach((doc) => {
            activities.push({ id: doc.id, ...doc.data() });
        });
        callback(activities);
        });
    }

    // Delete a shared capsule
    async deleteSharedCapsule(sharedCapsuleId) {
        try {
        const sharedCapsuleRef = doc(db, 'sharedCapsules', sharedCapsuleId);
        await deleteDoc(sharedCapsuleRef);
        } catch (error) {
        throw new Error(`Failed to delete shared capsule: ${error.message}`);
        }
    }

    // Remove a collaborator from a shared capsule
    async removeCollaborator(sharedCapsuleId, userId) {
        try {
        const sharedCapsuleRef = doc(db, 'sharedCapsules', sharedCapsuleId);
        await updateDoc(sharedCapsuleRef, {
            collaborators: arrayRemove(userId)
        });
        } catch (error) {
        throw new Error(`Failed to remove collaborator: ${error.message}`);
        }
    }
}

export default new FirestoreService();