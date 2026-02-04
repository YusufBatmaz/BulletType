import Phaser from 'phaser';
import { FirebaseService, ScoreEntry } from '../services/FirebaseService';

export class LeaderboardPanel {
  private firebaseService: FirebaseService;
  private container!: HTMLDivElement;
  private isLoading: boolean = false;
  private cachedScores: ScoreEntry[] = [];
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 10000; // 10 saniye cache

  constructor(firebaseService: FirebaseService) {
    this.firebaseService = firebaseService;
    this.createPanel();
    this.updateScores();
  }

  private createPanel(): void {
    // HTML container'ı al
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) return;

    // İçeriği temizle
    leaderboardContainer.innerHTML = '';

    // Panel içeriği
    this.container = document.createElement('div');
    this.container.style.padding = '20px';
    this.container.style.color = '#ffffff';
    this.container.style.fontFamily = 'Courier New, monospace';

    // Başlık
    const title = document.createElement('div');
    title.innerHTML = '🏆 TOP 10 🏆';
    title.style.fontSize = '24px';
    title.style.color = '#ffff00';
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    title.style.textShadow = '0 0 10px rgba(255, 255, 0, 0.5)';
    this.container.appendChild(title);

    // Çizgi
    const line = document.createElement('div');
    line.style.height = '2px';
    line.style.background = '#00ffff';
    line.style.margin = '10px 0 20px 0';
    line.style.boxShadow = '0 0 5px rgba(0, 255, 255, 0.5)';
    this.container.appendChild(line);

    // Loading göstergesi
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.innerHTML = '⏳ Yükleniyor...';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.color = '#00ffff';
    loadingDiv.style.fontSize = '14px';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.display = 'none';
    this.container.appendChild(loadingDiv);

    // Skor listesi
    const scoreList = document.createElement('div');
    scoreList.id = 'score-list';
    scoreList.style.marginBottom = '20px';
    this.container.appendChild(scoreList);

    // Kullanıcı sırası bölümü
    const userRankSection = document.createElement('div');
    userRankSection.style.marginTop = 'auto';
    userRankSection.style.paddingTop = '20px';
    userRankSection.style.borderTop = '2px solid rgba(0, 255, 255, 0.3)';

    const userRankTitle = document.createElement('div');
    userRankTitle.innerHTML = 'SENİN SIRAN';
    userRankTitle.style.fontSize = '16px';
    userRankTitle.style.color = '#00ffff';
    userRankTitle.style.fontWeight = 'bold';
    userRankTitle.style.textAlign = 'center';
    userRankTitle.style.marginBottom = '10px';
    userRankSection.appendChild(userRankTitle);

    const userRankText = document.createElement('div');
    userRankText.id = 'user-rank-text';
    userRankText.innerHTML = '---';
    userRankText.style.fontSize = '20px';
    userRankText.style.color = '#ffff00';
    userRankText.style.fontWeight = 'bold';
    userRankText.style.textAlign = 'center';
    userRankText.style.textShadow = '0 0 10px rgba(255, 255, 0, 0.5)';
    userRankSection.appendChild(userRankText);

    this.container.appendChild(userRankSection);
    leaderboardContainer.appendChild(this.container);
  }

  async updateScores(): Promise<void> {
    // Cache kontrolü
    const now = Date.now();
    if (this.cachedScores.length > 0 && (now - this.lastUpdateTime) < this.CACHE_DURATION) {
      console.log('📦 Cache\'den skorlar yüklendi');
      this.renderScores(this.cachedScores);
      await this.updateUserRank();
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const loadingIndicator = document.getElementById('loading-indicator');
    const scoreList = document.getElementById('score-list');
    
    if (loadingIndicator && scoreList) {
      loadingIndicator.style.display = 'block';
      scoreList.style.display = 'none';
    }

    try {
      // En iyi 10 skoru getir
      const topScores = await this.firebaseService.getTopScores(10);
      
      this.cachedScores = topScores;
      this.lastUpdateTime = Date.now();
      
      this.renderScores(topScores);
      await this.updateUserRank();
    } catch (error) {
      console.error('Skorları güncelleme hatası:', error);
      
      if (scoreList) {
        scoreList.innerHTML = '<div style="text-align: center; color: #ff6600; padding: 20px;">❌ Yükleme hatası</div>';
      }
    } finally {
      this.isLoading = false;
      
      if (loadingIndicator && scoreList) {
        loadingIndicator.style.display = 'none';
        scoreList.style.display = 'block';
      }
    }
  }

  // Cache'i atla ve fresh data yükle
  forceUpdate(): void {
    this.lastUpdateTime = 0; // Cache'i geçersiz kıl
    this.updateScores();
  }

  private renderScores(scores: ScoreEntry[]): void {
    const scoreList = document.getElementById('score-list');
    if (!scoreList) return;

    scoreList.innerHTML = '';

    if (scores.length === 0) {
      scoreList.innerHTML = '<div style="text-align: center; color: #888888; padding: 20px;">Henüz skor yok</div>';
      return;
    }

    // Skorları göster
    scores.forEach((entry, index) => {
      const scoreItem = document.createElement('div');
      scoreItem.style.display = 'flex';
      scoreItem.style.justifyContent = 'space-between';
      scoreItem.style.alignItems = 'center';
      scoreItem.style.padding = '8px 10px';
      scoreItem.style.marginBottom = '8px';
      scoreItem.style.background = 'rgba(0, 255, 255, 0.05)';
      scoreItem.style.borderRadius = '4px';
      scoreItem.style.border = '1px solid rgba(0, 255, 255, 0.2)';

      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const color = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#ffffff';

      const nameSpan = document.createElement('span');
      nameSpan.innerHTML = `${medal} ${entry.username.substring(0, 12)}`;
      nameSpan.style.color = color;
      nameSpan.style.fontSize = '14px';
      nameSpan.style.fontWeight = index < 3 ? 'bold' : 'normal';

      const scoreSpan = document.createElement('span');
      scoreSpan.innerHTML = `${entry.score}`;
      scoreSpan.style.color = color;
      scoreSpan.style.fontSize = '14px';
      scoreSpan.style.fontWeight = 'bold';

      scoreItem.appendChild(nameSpan);
      scoreItem.appendChild(scoreSpan);
      scoreList.appendChild(scoreItem);
    });
  }

  private async updateUserRank(): Promise<void> {
    const userRankText = document.getElementById('user-rank-text');
    if (!userRankText) return;

    const currentUser = this.firebaseService.getCurrentUser();
    
    if (!currentUser || currentUser.isAnonymous) {
      userRankText.innerHTML = 'Giriş yapın';
      userRankText.style.color = '#888888';
      return;
    }

    const userRank = await this.firebaseService.getUserRank();
    
    if (userRank) {
      userRankText.innerHTML = `#${userRank.rank} - ${userRank.score} puan`;
      userRankText.style.color = '#ffff00';
    } else {
      userRankText.innerHTML = 'Henüz skor yok';
      userRankText.style.color = '#888888';
    }
  }

  destroy(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}
