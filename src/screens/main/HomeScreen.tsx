import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Article } from '../../data/mockArticles';
import { fetchArticles } from '../../data/articleApi';
import { TabKey } from '../../components/BottomNavBar';

interface HomeScreenProps {
  onNavigateTab?: (tab: TabKey) => void;
}

interface KnowledgeBite {
  id: string;
  titleEn: string;
  titleVi: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  contentEn: string;
  contentVi: string;
  takeawayEn: string;
  takeawayVi: string;
}

const KNOWLEDGE_BITES: KnowledgeBite[] = [
  {
    id: 'bite-1',
    titleEn: 'How Blockchains Actually Work',
    titleVi: 'Cách thức hoạt động của Blockchain',
    category: 'Fundamentals',
    icon: 'cube-outline',
    iconColor: '#00FFE0',
    contentEn:
      'A blockchain is a decentralized digital ledger that records transactions across many computers so that the record cannot be altered retroactively.',
    contentVi:
      'Blockchain là một sổ cái kỹ thuật số phi tập trung ghi lại các giao dịch trên nhiều máy tính để không thể bị thay đổi sau khi ghi nhận.',
    takeawayEn: 'Key Takeaway: Trust comes from math & cryptography, not central intermediaries.',
    takeawayVi: 'Điểm cốt lõi: Niềm tin đến từ toán học và mật mã học, không qua trung gian.',
  },
  {
    id: 'bite-2',
    titleEn: 'The Golden Rule of Private Keys',
    titleVi: 'Quy tắc vàng về Private Key',
    category: 'Security',
    icon: 'shield-checkmark-outline',
    iconColor: '#00E676',
    contentEn:
      'Your 12-word seed phrase is the master key to all your crypto. Legitimate platforms or support teams will NEVER ask you for your private key or seed phrase.',
    contentVi:
      'Cụm từ khôi phục 12 từ là chìa khóa vạn năng cho tài sản crypto của bạn. Các nền tảng hay nhân viên hỗ trợ uy tín sẽ KHÔNG BAO GIỜ yêu cầu cụm từ này.',
    takeawayEn: 'Key Takeaway: Never enter your seed phrase online or share it in DMs.',
    takeawayVi: 'Điểm cốt lõi: Tuyệt đối không nhập cụm từ bí mật lên web lạ hoặc chia sẻ cho ai.',
  },
  {
    id: 'bite-3',
    titleEn: 'What is a Smart Contract?',
    titleVi: 'Hợp đồng thông minh là gì?',
    category: 'Web3 Tech',
    icon: 'code-slash-outline',
    iconColor: '#A855F7',
    contentEn:
      'A smart contract is a self-executing program running on Ethereum or Solana that executes automatically when predetermined conditions are met.',
    contentVi:
      'Hợp đồng thông minh là chương trình tự thực thi trên Ethereum hoặc Solana, tự động xử lý khi thỏa mãn các điều kiện đặt trước.',
    takeawayEn: 'Key Takeaway: Code is law — eliminating the need for trusted third parties.',
    takeawayVi: 'Điểm cốt lõi: Mã lệnh là luật — giảm thiểu phụ thuộc vào bên thứ ba.',
  },
  {
    id: 'bite-4',
    titleEn: 'Proof of Stake vs. Proof of Work',
    titleVi: 'Proof of Stake khác gì Proof of Work?',
    category: 'Consensus',
    icon: 'flash-outline',
    iconColor: '#F59E0B',
    contentEn:
      'While Bitcoin uses computational energy (PoW) to secure its network, modern blockchains like Ethereum use locked capital (PoS), cutting energy use by 99.9%.',
    contentVi:
      'Trong khi Bitcoin dùng điện toán (PoW) để bảo vệ mạng, các mạng hiện đại như Ethereum dùng vốn cổ phần (PoS), giảm hơn 99.9% năng lượng.',
    takeawayEn: 'Key Takeaway: PoS provides high security with dramatic energy efficiency.',
    takeawayVi: 'Điểm cốt lõi: PoS bảo mật cao với hiệu suất tiết kiệm năng lượng tối ưu.',
  },
];

const GLOSSARY_TERMS = [
  {
    term: 'Blockchain',
    definitionEn: 'A distributed digital ledger storing encrypted blocks of transaction data permanently.',
    definitionVi: 'Sổ cái điện tử phân tán lưu trữ các khối dữ liệu giao dịch được mã hóa vĩnh viễn.',
  },
  {
    term: 'Private Key',
    definitionEn: 'A secret cryptographic key that proves ownership of assets and signs transactions.',
    definitionVi: 'Khóa mật mã bí mật dùng để chứng minh quyền sở hữu tài sản và ký giao dịch.',
  },
  {
    term: 'Seed Phrase',
    definitionEn: 'A sequence of 12 or 24 random words providing a readable backup to regenerate all private keys.',
    definitionVi: 'Chuỗi 12 hoặc 24 từ ngẫu nhiên dùng để sao lưu và khôi phục toàn bộ ví của bạn.',
  },
  {
    term: 'Gas Fee',
    definitionEn: 'Transaction fee paid to validators/miners to process operations on a decentralized network.',
    definitionVi: 'Phí giao dịch trả cho người xác thực để xử lý thao tác trên mạng lưới phi tập trung.',
  },
  {
    term: 'Smart Contract',
    definitionEn: 'Automated software code on a blockchain that executes when specific conditions occur.',
    definitionVi: 'Đoạn mã tự động trên blockchain sẽ tự thi hành khi thỏa mãn điều kiện quy định.',
  },
  {
    term: 'DeFi (Decentralized Finance)',
    definitionEn: 'Financial services (lending, borrowing, trading) built using smart contracts without banks.',
    definitionVi: 'Các dịch vụ tài chính (cho vay, mượn, giao dịch) xây dựng trên hợp đồng thông minh không qua ngân hàng.',
  },
  {
    term: 'Cold Storage',
    definitionEn: 'Storing crypto private keys entirely offline on a specialized hardware device for max safety.',
    definitionVi: 'Lưu trữ khóa bí mật hoàn toàn ngoại tuyến trên thiết bị phần cứng để an toàn tối đa.',
  },
  {
    term: 'Staking',
    definitionEn: 'Locking tokens to help validate and secure a Proof-of-Stake network in exchange for rewards.',
    definitionVi: 'Khóa token để tham gia xác thực và bảo vệ mạng Proof-of-Stake để nhận phần thưởng học tập.',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab }) => {
  const insets = useSafeAreaInsets();
  const { user, language } = useAuth();

  const [currentBiteIndex, setCurrentBiteIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [articles, setArticles] = useState<Article[]>([]);
  const [glossaryModalVisible, setGlossaryModalVisible] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');

  const currentBite = KNOWLEDGE_BITES[currentBiteIndex];

  const handleNextBite = () => {
    setCurrentBiteIndex((prev) => (prev + 1) % KNOWLEDGE_BITES.length);
  };

  const handlePrevBite = () => {
    setCurrentBiteIndex((prev) => (prev - 1 + KNOWLEDGE_BITES.length) % KNOWLEDGE_BITES.length);
  };

  useEffect(() => {
    fetchArticles().then(setArticles).catch(() => setArticles([]));
  }, []);

  const filteredArticles = articles.filter((item) => {
    if (selectedTopic === 'All') return true;
    return item.category.toLowerCase() === selectedTopic.toLowerCase();
  });

  const filteredGlossary = GLOSSARY_TERMS.filter((g) =>
    g.term.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'G'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>
                {language === 'vi' ? 'Xin chào,' : 'Welcome back,'}
              </Text>
              <Text style={styles.userName}>{user?.name || 'Crypto Learner'}</Text>
            </View>
          </View>

          {/* Learning Streak Badge */}
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#F59E0B" />
            <Text style={styles.streakText}>
              {user?.learningStreak ?? 0} {language === 'vi' ? 'Ngày liên tục' : 'Day Streak'}
            </Text>
          </View>
        </View>

        {/* Education Hero Card: Learning Journey */}
        <View style={styles.learningHeroCard}>
          <View style={styles.learningHeroHeader}>
            <View style={styles.heroTitleRow}>
              <View style={styles.levelIconWrap}>
                <Ionicons name="sparkles" size={16} color="#00FFE0" />
              </View>
              <View>
                <Text style={styles.learningHubLabel}>
                  {language === 'vi' ? 'TRUNG TÂM KIẾN THỨC' : 'CRYPTO EDUCATION HUB'}
                </Text>
                <Text style={styles.levelRankText}>
                  {language === 'vi' ? 'Cấp độ 2 • Người khám phá Web3' : 'Level 2 • Web3 Explorer'}
                </Text>
              </View>
            </View>

            <View style={styles.learningPill}>
              <Text style={styles.learningPillText}>
                {language === 'vi' ? 'Học miễn phí' : '100% Free'}
              </Text>
            </View>
          </View>

          {/* Knowledge Points Score */}
          <View style={styles.pointsDisplaySection}>
            <Text style={styles.pointsNumber}>
              {(user?.gobxPoints ?? 0).toLocaleString()}
            </Text>
            <View style={styles.pointsMetaRow}>
              <Ionicons name="trophy" size={16} color="#00FFE0" />
              <Text style={styles.pointsLabel}>
                {language === 'vi' ? 'Điểm kiến thức GOBX đã tích lũy' : 'Knowledge Points Earned'}
              </Text>
            </View>
          </View>

          {/* Mini Learning Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{user?.quizzesCompleted ?? 0}</Text>
              <Text style={styles.metricLabel}>
                {language === 'vi' ? 'Quiz hoàn thành' : 'Quizzes Done'}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{user?.articlesRead ?? 0}</Text>
              <Text style={styles.metricLabel}>
                {language === 'vi' ? 'Bài học đã đọc' : 'Lessons Read'}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>—</Text>
              <Text style={styles.metricLabel}>
                {language === 'vi' ? 'Độ chính xác' : 'Accuracy'}
              </Text>
            </View>
          </View>

          {/* Hero Action CTA */}
          <TouchableOpacity
            style={styles.heroCtaBtn}
            activeOpacity={0.8}
            onPress={() => onNavigateTab?.('quiz')}
          >
            <Ionicons name="play" size={16} color="#030712" />
            <Text style={styles.heroCtaBtnText}>
              {language === 'vi' ? 'Làm Quiz kiếm thêm điểm' : 'Daily Quiz Challenge (+50 Pts)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Educational Quick Navigation Actions */}
        <View style={styles.actionSectionHeader}>
          <Text style={styles.sectionHeading}>
            {language === 'vi' ? 'Chủ đề học tập' : 'Learning Channels'}
          </Text>
          <Text style={styles.sectionSubHeading}>
            {language === 'vi' ? 'Chọn mục bạn muốn tìm hiểu' : 'Choose what you want to explore'}
          </Text>
        </View>

        <View style={styles.eduActionGrid}>
          {/* Action 1: Crypto Academy */}
          <TouchableOpacity
            style={styles.eduActionCard}
            activeOpacity={0.8}
            onPress={() => onNavigateTab?.('articles')}
          >
            <View style={[styles.eduActionIconBox, { backgroundColor: 'rgba(0, 255, 224, 0.12)' }]}>
              <Ionicons name="book-outline" size={24} color="#00FFE0" />
            </View>
            <Text style={styles.eduActionTitle}>
              {language === 'vi' ? 'Học viện' : 'Academy'}
            </Text>
            <Text style={styles.eduActionDesc}>
              {language === 'vi' ? 'Bài viết chuyên sâu' : 'Deep dive articles'}
            </Text>
          </TouchableOpacity>

          {/* Action 2: Daily Crypto Quiz */}
          <TouchableOpacity
            style={styles.eduActionCard}
            activeOpacity={0.8}
            onPress={() => onNavigateTab?.('quiz')}
          >
            <View style={[styles.eduActionIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
              <Ionicons name="help-circle-outline" size={24} color="#00E676" />
            </View>
            <Text style={styles.eduActionTitle}>
              {language === 'vi' ? 'Trắc nghiệm' : 'Quiz Hub'}
            </Text>
            <Text style={styles.eduActionDesc}>
              {language === 'vi' ? 'Kiểm tra kiến thức' : 'Test your skills'}
            </Text>
          </TouchableOpacity>

          {/* Action 3: Security 101 */}
          <TouchableOpacity
            style={styles.eduActionCard}
            activeOpacity={0.8}
            onPress={() => {
              const secArticle = articles.find((a) => a.category === 'Security');
              if (secArticle) setSelectedArticle(secArticle);
              else onNavigateTab?.('articles');
            }}
          >
            <View style={[styles.eduActionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Ionicons name="shield-outline" size={24} color="#EF4444" />
            </View>
            <Text style={styles.eduActionTitle}>
              {language === 'vi' ? 'Bảo mật ví' : 'Wallet Safety'}
            </Text>
            <Text style={styles.eduActionDesc}>
              {language === 'vi' ? 'Chống lừa đảo & hack' : 'Protect your keys'}
            </Text>
          </TouchableOpacity>

          {/* Action 4: Web3 Glossary */}
          <TouchableOpacity
            style={styles.eduActionCard}
            activeOpacity={0.8}
            onPress={() => setGlossaryModalVisible(true)}
          >
            <View style={[styles.eduActionIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
              <Ionicons name="reader-outline" size={24} color="#A855F7" />
            </View>
            <Text style={styles.eduActionTitle}>
              {language === 'vi' ? 'Thuật ngữ' : 'Web3 Terms'}
            </Text>
            <Text style={styles.eduActionDesc}>
              {language === 'vi' ? 'Từ điển Crypto A-Z' : 'Crypto Glossary A-Z'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Knowledge Bite Card */}
        <View style={styles.knowledgeBiteCard}>
          <View style={styles.biteTopBar}>
            <View style={styles.biteBadge}>
              <Ionicons name={currentBite.icon} size={14} color={currentBite.iconColor} />
              <Text style={[styles.biteBadgeText, { color: currentBite.iconColor }]}>
                {currentBite.category.toUpperCase()}
              </Text>
            </View>

            <View style={styles.biteNavArrows}>
              <TouchableOpacity onPress={handlePrevBite} style={styles.biteNavBtn}>
                <Ionicons name="chevron-back" size={18} color="#94A3B8" />
              </TouchableOpacity>
              <Text style={styles.biteCounterText}>
                {currentBiteIndex + 1}/{KNOWLEDGE_BITES.length}
              </Text>
              <TouchableOpacity onPress={handleNextBite} style={styles.biteNavBtn}>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.biteTitle}>
            {language === 'vi' ? currentBite.titleVi : currentBite.titleEn}
          </Text>

          <Text style={styles.biteContent}>
            {language === 'vi' ? currentBite.contentVi : currentBite.contentEn}
          </Text>

          <View style={styles.takeawayBox}>
            <Ionicons name="bulb-outline" size={16} color="#00FFE0" />
            <Text style={styles.takeawayText}>
              {language === 'vi' ? currentBite.takeawayVi : currentBite.takeawayEn}
            </Text>
          </View>
        </View>

        {/* Featured Educational Lessons Section */}
        <View style={styles.lessonsSectionHeader}>
          <View>
            <Text style={styles.sectionHeading}>
              {language === 'vi' ? 'Bài học chọn lọc' : 'Featured Lessons'}
            </Text>
            <Text style={styles.sectionSubHeading}>
              {language === 'vi' ? 'Kiến thức cốt lõi cho mọi học viên' : 'Core crypto insights & fundamentals'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => onNavigateTab?.('articles')}
          >
            <Text style={styles.viewAllBtnText}>
              {language === 'vi' ? 'Xem tất cả' : 'View All'}
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#00FFE0" />
          </TouchableOpacity>
        </View>

        {/* Topic Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicScroll}
        >
          {['All', 'Security', 'Bitcoin', 'DeFi', 'Web3'].map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[
                styles.topicPill,
                selectedTopic === topic && styles.topicPillActive,
              ]}
              onPress={() => setSelectedTopic(topic)}
            >
              <Text
                style={[
                  styles.topicPillText,
                  selectedTopic === topic && styles.topicPillTextActive,
                ]}
              >
                {topic}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lesson Cards List */}
        <View style={styles.lessonsList}>
          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.lessonCard}
              activeOpacity={0.85}
              onPress={() => setSelectedArticle(article)}
            >
              <View style={styles.lessonHeaderRow}>
                <View style={styles.lessonCategoryPill}>
                  <Text style={styles.lessonCategoryText}>{article.category}</Text>
                </View>
                <View style={styles.lessonReadTimeRow}>
                  <Ionicons name="time-outline" size={13} color="#94A3B8" />
                  <Text style={styles.lessonReadTimeText}>{article.readTime}</Text>
                </View>
              </View>

              <Text style={styles.lessonTitle}>{article.title}</Text>
              <Text style={styles.lessonSummary} numberOfLines={2}>
                {article.summary}
              </Text>

              <View style={styles.lessonFooter}>
                <View style={styles.lessonAuthorRow}>
                  <Ionicons name="person-circle-outline" size={16} color="#64748B" />
                  <Text style={styles.lessonAuthorText}>{article.author}</Text>
                </View>

                <View style={styles.readLessonCta}>
                  <Text style={styles.readLessonCtaText}>
                    {language === 'vi' ? 'Đọc bài' : 'Start Reading'}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#00FFE0" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {!filteredArticles.length && (
            <Text style={styles.lessonSummary}>
              {language === 'vi' ? 'Chưa có bài viết trực tiếp. Vui lòng thử lại sau.' : 'No live articles are available right now. Please try again later.'}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Article Detail Reader Modal */}
      <Modal
        visible={!!selectedArticle}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        <View style={styles.readerModalBackdrop}>
          <View style={styles.readerModalContainer}>
            <View style={styles.readerModalHeader}>
              <View style={styles.readerCategoryPill}>
                <Text style={styles.readerCategoryText}>
                  {selectedArticle?.category}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedArticle(null)}
                style={styles.readerCloseBtn}
              >
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.readerScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.readerTitle}>{selectedArticle?.title}</Text>

              <View style={styles.readerMetaRow}>
                <View style={styles.readerAuthorWrap}>
                  <Ionicons name="person-circle-outline" size={18} color="#00FFE0" />
                  <Text style={styles.readerAuthorName}>
                    {selectedArticle?.author}
                  </Text>
                </View>
                <Text style={styles.readerDot}>•</Text>
                <Text style={styles.readerTime}>
                  {selectedArticle?.readTime}
                </Text>
              </View>

              <View style={styles.readerSummaryBox}>
                <Text style={styles.readerSummaryText}>
                  {selectedArticle?.summary}
                </Text>
              </View>

              {selectedArticle?.content.map((paragraph, idx) => (
                <Text key={idx} style={styles.readerParagraph}>
                  {paragraph}
                </Text>
              ))}

              <View style={styles.readerEndNote}>
                <Ionicons name="school" size={20} color="#00FFE0" />
                <Text style={styles.readerEndNoteText}>
                  {language === 'vi'
                    ? 'Bạn đã hoàn thành bài học! Làm quiz để nhận thêm điểm thưởng.'
                    : 'Lesson Completed! Test your understanding in the Quiz Hub to earn points.'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.readerQuizCta}
                onPress={() => {
                  setSelectedArticle(null);
                  onNavigateTab?.('quiz');
                }}
              >
                <Ionicons name="trophy-outline" size={18} color="#030712" />
                <Text style={styles.readerQuizCtaText}>
                  {language === 'vi' ? 'Làm Quiz ngay' : 'Take Quiz On This Topic'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Web3 Glossary Modal */}
      <Modal
        visible={glossaryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGlossaryModalVisible(false)}
      >
        <View style={styles.readerModalBackdrop}>
          <View style={styles.readerModalContainer}>
            <View style={styles.readerModalHeader}>
              <View style={styles.glossaryTitleWrap}>
                <Ionicons name="book-outline" size={20} color="#00FFE0" />
                <Text style={styles.glossaryModalTitle}>
                  {language === 'vi' ? 'Từ Điển Crypto A-Z' : 'Web3 Glossary A-Z'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setGlossaryModalVisible(false)}
                style={styles.readerCloseBtn}
              >
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.readerScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.glossaryIntroText}>
                {language === 'vi'
                  ? 'Tổng hợp các thuật ngữ tiền mã hóa và công nghệ blockchain cơ bản cho người mới bắt đầu.'
                  : 'Essential cryptocurrency, DeFi, and blockchain terms explained in simple language.'}
              </Text>

              {filteredGlossary.map((item, index) => (
                <View key={index} style={styles.glossaryCard}>
                  <View style={styles.glossaryTermRow}>
                    <Text style={styles.glossaryTerm}>{item.term}</Text>
                    <View style={styles.glossaryNumPill}>
                      <Text style={styles.glossaryNumText}>#{index + 1}</Text>
                    </View>
                  </View>
                  <Text style={styles.glossaryDef}>
                    {language === 'vi' ? item.definitionVi : item.definitionEn}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#00FFE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#00FFE0',
    fontSize: 18,
    fontWeight: '800',
  },
  greeting: {
    color: '#94A3B8',
    fontSize: 12,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  streakText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  learningHeroCard: {
    backgroundColor: '#0B0F19',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 255, 224, 0.25)',
    padding: 20,
    marginBottom: 24,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 32px rgba(0, 255, 224, 0.08)',
        }
      : {
          shadowColor: '#00FFE0',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 6,
        }),
  },
  learningHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 224, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  learningHubLabel: {
    color: '#00FFE0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  levelRankText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  learningPill: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  learningPillText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  pointsDisplaySection: {
    marginBottom: 16,
  },
  pointsNumber: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pointsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  pointsLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    color: '#00FFE0',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFE0',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  heroCtaBtnText: {
    color: '#030712',
    fontSize: 14,
    fontWeight: '800',
  },
  actionSectionHeader: {
    marginBottom: 14,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubHeading: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  eduActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  eduActionCard: {
    width: '48%',
    backgroundColor: '#0B0F19',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  eduActionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  eduActionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  eduActionDesc: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
  },
  knowledgeBiteCard: {
    backgroundColor: '#0E1424',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.2)',
    padding: 18,
    marginBottom: 24,
  },
  biteTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  biteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  biteBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  biteNavArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  biteNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biteCounterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  biteTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 22,
  },
  biteContent: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  takeawayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 224, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#00FFE0',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  takeawayText: {
    flex: 1,
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  lessonsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllBtnText: {
    color: '#00FFE0',
    fontSize: 13,
    fontWeight: '700',
  },
  topicScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  topicPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#0B0F19',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  topicPillActive: {
    backgroundColor: 'rgba(0, 255, 224, 0.15)',
    borderColor: '#00FFE0',
  },
  topicPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  topicPillTextActive: {
    color: '#00FFE0',
    fontWeight: '700',
  },
  lessonsList: {
    gap: 12,
  },
  lessonCard: {
    backgroundColor: '#0B0F19',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonCategoryPill: {
    backgroundColor: 'rgba(0, 255, 224, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lessonCategoryText: {
    color: '#00FFE0',
    fontSize: 11,
    fontWeight: '700',
  },
  lessonReadTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonReadTimeText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  lessonTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 20,
  },
  lessonSummary: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
  },
  lessonAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonAuthorText: {
    color: '#64748B',
    fontSize: 11,
  },
  readLessonCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readLessonCtaText: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '700',
  },
  readerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  readerModalContainer: {
    backgroundColor: '#0B0F19',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.25)',
    height: '90%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  readerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  readerCategoryPill: {
    backgroundColor: 'rgba(0, 255, 224, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readerCategoryText: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '700',
  },
  readerCloseBtn: {
    padding: 4,
  },
  readerScroll: {
    flex: 1,
    paddingTop: 16,
  },
  readerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 10,
  },
  readerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  readerAuthorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readerAuthorName: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  readerDot: {
    color: '#475569',
    fontSize: 12,
  },
  readerTime: {
    color: '#64748B',
    fontSize: 12,
  },
  readerSummaryBox: {
    backgroundColor: 'rgba(0, 255, 224, 0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#00FFE0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  readerSummaryText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  readerParagraph: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  readerEndNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginTop: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  readerEndNoteText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  readerQuizCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFE0',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 40,
  },
  readerQuizCtaText: {
    color: '#030712',
    fontSize: 14,
    fontWeight: '800',
  },
  glossaryTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  glossaryModalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  glossaryIntroText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  glossaryCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  glossaryTermRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  glossaryTerm: {
    color: '#00FFE0',
    fontSize: 15,
    fontWeight: '700',
  },
  glossaryNumPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  glossaryNumText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  glossaryDef: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
});
