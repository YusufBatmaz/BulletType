import { 
  signInAnonymously, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../config/FirebaseConfig';

export interface ScoreEntry {
  username: string;
  score: number;
  timestamp: Date;
  userId: string;
}

export class FirebaseService {
  private currentUser: User | null = null;
  private isAnonymous: boolean = true;

  constructor() {
    // Auth durumunu dinle
    auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      this.isAnonymous = user?.isAnonymous ?? true;
      
      if (user) {
        console.log('🔐 Auth state değişti:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isAnonymous: user.isAnonymous
        });
        
        // Token'ı kontrol et
        try {
          const token = await user.getIdToken();
          console.log('✅ Token alındı (ilk 20 karakter):', token.substring(0, 20) + '...');
        } catch (error) {
          console.error('❌ Token alma hatası:', error);
        }
      } else {
        console.log('🔓 Kullanıcı çıkış yaptı');
      }
    });
  }

  // Anonim giriş (kullanıcı adı/şifre girmeden)
  async signInAnonymously(): Promise<void> {
    try {
      const result = await signInAnonymously(auth);
      this.currentUser = result.user;
      this.isAnonymous = true;
      console.log('Anonim giriş başarılı');
    } catch (error) {
      console.error('Anonim giriş hatası:', error);
      throw error;
    }
  }

  // Kullanıcı adı ve şifre ile kayıt
  async signUpWithCredentials(username: string, email: string, password: string): Promise<void> {
    try {
      // Email formatı oluştur (kullanıcı adından)
      const generatedEmail = email && email.trim() !== '' ? email : `${username}@bullettype.local`;
      
      const result = await createUserWithEmailAndPassword(auth, generatedEmail, password);
      this.currentUser = result.user;
      this.isAnonymous = false;

      // Kullanıcı adını profilde sakla
      await updateProfile(result.user, {
        displayName: username
      });

      console.log('Kayıt başarılı:', username);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Zaten kayıtlıysa giriş yap
        const loginEmail = email && email.trim() !== '' ? email : `${username}@bullettype.local`;
        await this.signInWithCredentials(loginEmail, password);
      } else {
        console.error('Kayıt hatası:', error);
        throw error;
      }
    }
  }

  // Kullanıcı adı ve şifre ile giriş
  async signInWithCredentials(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser = result.user;
      this.isAnonymous = false;
      console.log('Giriş başarılı');
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  }

  // Skor kaydet (sadece en yüksek skor tutulur)
  async saveScore(score: number): Promise<void> {
    console.log('saveScore çağrıldı:', { 
      score, 
      hasUser: !!this.currentUser, 
      isAnonymous: this.isAnonymous,
      uid: this.currentUser?.uid,
      displayName: this.currentUser?.displayName,
      email: this.currentUser?.email
    });

    if (!this.currentUser) {
      console.warn('Kullanıcı giriş yapmamış, skor kaydedilemiyor');
      return;
    }

    // Anonim kullanıcılar skor kaydedemez
    if (this.isAnonymous) {
      console.warn('Anonim kullanıcılar skor kaydedemez');
      return;
    }

    try {
      // Token'ı yenile ve kontrol et
      let token: string;
      try {
        token = await this.currentUser.getIdToken(true); // true = force refresh
        console.log('🔑 Token yenilendi (ilk 30 karakter):', token.substring(0, 30) + '...');
        console.log('🔑 Token uzunluğu:', token.length);
      } catch (tokenError) {
        console.error('⚠️ Token yenileme hatası:', tokenError);
        throw new Error('Token alınamadı. Lütfen tekrar giriş yapın.');
      }
      
      const username = this.currentUser.displayName || 'Anonim';
      const userId = this.currentUser.uid;
      
      console.log('📝 Firestore işlemi başlıyor:', { 
        userId, 
        username, 
        score,
        email: this.currentUser.email,
        emailVerified: this.currentUser.emailVerified
      });
      
      // Kullanıcının mevcut skorunu kontrol et
      const userScoreRef = doc(db, 'scores', userId);
      console.log('📍 Firestore path:', `scores/${userId}`);
      
      const userScoreDoc = await getDoc(userScoreRef);
      
      if (userScoreDoc.exists()) {
        const currentScore = userScoreDoc.data().score;
        console.log('📊 Mevcut skor:', currentScore);
        
        if (score > currentScore) {
          // Yeni skor daha yüksekse güncelle
          await setDoc(userScoreRef, {
            username: username,
            score: score,
            timestamp: Timestamp.now(),
            userId: userId
          });
          console.log(`✅ Skor güncellendi: ${currentScore} → ${score}`);
        } else {
          console.log(`ℹ️ Mevcut skor daha yüksek: ${currentScore} >= ${score} (güncellenmedi)`);
        }
      } else {
        console.log('📝 İlk skor kaydı oluşturuluyor...');
        // İlk skor kaydı
        await setDoc(userScoreRef, {
          username: username,
          score: score,
          timestamp: Timestamp.now(),
          userId: userId
        });
        console.log('✅ İlk skor kaydedildi:', score);
      }
    } catch (error: any) {
      console.error('❌ Skor kaydetme hatası:', error);
      console.error('Hata detayı:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Kullanıcıya anlamlı hata mesajı
      if (error.code === 'permission-denied') {
        console.error('🚫 İzin hatası: Firestore kurallarını kontrol edin!');
        console.error('Firebase Console > Firestore Database > Rules bölümünden kuralları yayınlayın.');
      } else if (error.message?.includes('authentication')) {
        console.error('🔐 Kimlik doğrulama hatası: Lütfen tekrar giriş yapın.');
      }
      
      throw error;
    }
  }

  // En iyi 10 skoru getir
  async getTopScores(limitCount: number = 10): Promise<ScoreEntry[]> {
    try {
      const scoresRef = collection(db, 'scores');
      const q = query(scoresRef, orderBy('score', 'desc'), limit(limitCount));
      
      const querySnapshot = await getDocs(q);
      const scores: ScoreEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scores.push({
          username: data.username,
          score: data.score,
          timestamp: data.timestamp.toDate(),
          userId: data.userId
        });
      });

      return scores;
    } catch (error) {
      console.error('Skorları getirme hatası:', error);
      return [];
    }
  }

  // Kullanıcının sırasını getir
  async getUserRank(): Promise<{ rank: number; score: number } | null> {
    if (!this.currentUser || this.isAnonymous) {
      return null;
    }

    try {
      // Kullanıcının skorunu al
      const userScoreRef = doc(db, 'scores', this.currentUser.uid);
      const userScoreDoc = await getDoc(userScoreRef);
      
      if (!userScoreDoc.exists()) {
        console.log('Kullanıcının skoru bulunamadı');
        return null;
      }
      
      const userScore = userScoreDoc.data().score;
      console.log('Kullanıcının skoru:', userScore);
      
      // Tüm skorları al ve sırala
      const scoresRef = collection(db, 'scores');
      const q = query(scoresRef, orderBy('score', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let rank = 0;
      let found = false;
      
      querySnapshot.forEach((docSnapshot) => {
        if (!found) {
          rank++;
          if (docSnapshot.id === this.currentUser?.uid) {
            found = true;
          }
        }
      });

      console.log('Kullanıcının sırası:', rank);
      return { rank, score: userScore };
    } catch (error) {
      console.error('Kullanıcı sırası getirme hatası:', error);
      return null;
    }
  }

  // Kullanıcı bilgilerini getir
  getCurrentUser(): { username: string; isAnonymous: boolean } | null {
    if (!this.currentUser) {
      return null;
    }

    return {
      username: this.currentUser.displayName || 'Anonim',
      isAnonymous: this.isAnonymous
    };
  }

  // Kullanıcı giriş yapmış mı?
  isLoggedIn(): boolean {
    return this.currentUser !== null && !this.isAnonymous;
  }

  // Çıkış yap
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentUser = null;
      this.isAnonymous = true;
      console.log('Çıkış yapıldı');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  }
}
