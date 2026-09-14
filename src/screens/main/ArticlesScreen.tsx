import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Article } from '../../data/mockArticles';
import { fetchArticles } from '../../data/articleApi';
import { useAuth } from '../../context/AuthContext';

export const ArticlesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { language } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [articleLoadError, setArticleLoadError] = useState(false);

  const categories = ['All', 'Bitcoin', 'Web3', 'DeFi', 'Security', 'Analysis'];

  const loadArticles = async () => {
    setIsLoadingArticles(true);
    setArticleLoadError(false);
    try {
      const remoteArticles = await fetchArticles();
      if (remoteArticles.length) setArticles(remoteArticles);
    } catch {
      setArticleLoadError(true);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const filteredArticles = articles.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return matchesCategory;

    const searchableText = [
      item.title,
      item.summary,
      item.author,
      item.category,
      ...item.content,
    ].join(' ').toLowerCase();

    return matchesCategory && searchableText.includes(normalizedQuery);
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const featuredArticle = articles.find((a) => a.trending) || articles[0];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenSubtitle}>
              {language === 'vi' ? 'Kiến thức & Tin tức' : 'Insights & News'}
            </Text>
            <Text style={styles.screenTitle}>
              {language === 'vi' ? 'Gobax Research' : 'Gobax Articles'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => {
              setSearchVisible((visible) => !visible);
              if (searchVisible) setSearchQuery('');
            }}
            accessibilityLabel={searchVisible ? 'Close search' : 'Search articles'}
          >
            <Ionicons name={searchVisible ? 'close' : 'search'} size={20} color="#00FFE0" />
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={language === 'vi' ? 'Tìm kiếm bài viết' : 'Search articles'}
            placeholderTextColor="#64748B"
            style={styles.searchInput}
            returnKeyType="search"
          />
        )}

        {isLoadingArticles && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#00FFE0" size="small" />
            <Text style={styles.loadingText}>Loading latest articles...</Text>
          </View>
        )}

        {articleLoadError && !isLoadingArticles && (
          <TouchableOpacity style={styles.sourceNotice} onPress={loadArticles}>
            <Text style={styles.sourceNoticeText}>
              Live feed unavailable. No articles are shown until the source is available. Tap to retry.
            </Text>
          </TouchableOpacity>
        )}

        {/* Category Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Card (when All or matching) */}
        {selectedCategory === 'All' && featuredArticle && (
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.85}
            onPress={() => setSelectedArticle(featuredArticle)}
          >
            <View style={styles.featuredBadgeRow}>
              <View style={styles.trendingBadge}>
                <Ionicons name="flame" size={14} color="#FFFFFF" />
                <Text style={styles.trendingText}>FEATURED</Text>
              </View>
              <Text style={styles.readTimeText}>{featuredArticle.readTime}</Text>
            </View>

            <Text style={styles.featuredTitle}>{featuredArticle.title}</Text>
            <Text style={styles.featuredSummary} numberOfLines={2}>
              {featuredArticle.summary}
            </Text>

            <Text style={styles.sourceText}>Source: {featuredArticle.source}</Text>

            <View style={styles.featuredFooter}>
              <Text style={styles.authorText}>By {featuredArticle.author}</Text>
              <View style={styles.readMorePill}>
                <Text style={styles.readMoreText}>Read Article</Text>
                <Ionicons name="arrow-forward" size={13} color="#00FFE0" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Article Feed Header */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>
            {language === 'vi' ? 'Bài viết mới nhất' : 'Latest Insights'}
          </Text>
          <Text style={styles.feedCount}>
            {filteredArticles.length} {language === 'vi' ? 'bài viết' : 'articles'}
          </Text>
        </View>

        {/* Articles List */}
        {filteredArticles.map((article) => {
          const isBookmarked = bookmarkedIds.includes(article.id);
          return (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              activeOpacity={0.75}
              onPress={() => setSelectedArticle(article)}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: 'rgba(0, 255, 224, 0.12)' },
                  ]}
                >
                  <Text style={styles.categoryTagText}>{article.category}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleBookmark(article.id)}
                  style={styles.bookmarkBtn}
                >
                  <Ionicons
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={isBookmarked ? '#00FFE0' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleSummary} numberOfLines={2}>
                {article.summary}
              </Text>
              <Text style={styles.sourceText}>Source: {article.source}</Text>

              <View style={styles.articleFooter}>
                <View style={styles.metaLeft}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{article.readTime}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{article.publishedAt}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#64748B" />
              </View>
            </TouchableOpacity>
          );
        })}
        {!isLoadingArticles && !filteredArticles.length && (
          <Text style={styles.sourceNoticeText}>No live articles match this selection.</Text>
        )}
      </ScrollView>

      {/* Full Article Reader Modal */}
      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedArticle(null)}
      >
        <View style={[styles.readerContainer, { paddingTop: insets.top + 10 }]}>
          {/* Reader Top Bar */}
          <View style={styles.readerTopBar}>
            <TouchableOpacity
              onPress={() => setSelectedArticle(null)}
              style={styles.readerCloseBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.readerActions}>
              <TouchableOpacity
                onPress={() => selectedArticle && toggleBookmark(selectedArticle.id)}
                style={styles.readerActionBtn}
              >
                <Ionicons
                  name={
                    selectedArticle && bookmarkedIds.includes(selectedArticle.id)
                      ? 'bookmark'
                      : 'bookmark-outline'
                  }
                  size={20}
                  color="#00FFE0"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.readerActionBtn}>
                <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reader Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.readerScroll}
            showsVerticalScrollIndicator={false}
          >
            {selectedArticle && (
              <>
                <View style={styles.readerTag}>
                  <Text style={styles.readerTagText}>
                    {selectedArticle.category}
                  </Text>
                </View>

                <Text style={styles.readerTitle}>{selectedArticle.title}</Text>

                <View style={styles.readerMetaRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitial}>
                      {selectedArticle.author[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.readerAuthor}>
                      {selectedArticle.author}
                    </Text>
                    <Text style={styles.readerTimestamp}>
                      {selectedArticle.publishedAt} · {selectedArticle.readTime}
                    </Text>
                    <TouchableOpacity
                      disabled={!selectedArticle.sourceUrl}
                      onPress={() => selectedArticle.sourceUrl && Linking.openURL(selectedArticle.sourceUrl)}
                    >
                      <Text style={styles.readerSource}>
                        Source: {selectedArticle.source}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.readerDivider} />

                <Text style={styles.readerCallout}>
                  "{selectedArticle.summary}"
                </Text>

                {selectedArticle.content.map((paragraph, idx) => (
                  <Text key={idx} style={styles.readerParagraph}>
                    {paragraph}
                  </Text>
                ))}

                <View style={styles.verifiedArticleBox}>
                  <Ionicons name="open-outline" size={22} color="#00E676" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.verifiedTitle}>Original source</Text>
                    <Text style={styles.verifiedSub}>
                      Open the publisher link above for the complete article and any updates.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenSubtitle: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.3)',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 8,
  },
  sourceNotice: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.28)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  sourceNoticeText: {
    color: '#FCD34D',
    fontSize: 12,
  },
  categoryScroll: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: '#00D06C',
    borderColor: '#00E676',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  featuredCard: {
    backgroundColor: '#0B0F19',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 255, 224, 0.35)',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#00FFE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 30px rgba(0, 255, 224, 0.15)',
        }
      : {}),
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  trendingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  readTimeText: {
    color: '#64748B',
    fontSize: 12,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 10,
  },
  featuredSummary: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  authorText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  readMorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    color: '#00FFE0',
    fontSize: 13,
    fontWeight: '700',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  feedCount: {
    color: '#64748B',
    fontSize: 13,
  },
  articleCard: {
    backgroundColor: '#0B0F19',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: {
    color: '#00FFE0',
    fontSize: 11,
    fontWeight: '700',
  },
  bookmarkBtn: {
    padding: 4,
  },
  articleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  articleSummary: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  sourceText: {
    color: '#00FFE0',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 10,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#64748B',
    fontSize: 12,
  },
  metaDot: {
    color: '#475569',
    fontSize: 12,
  },
  readerContainer: {
    flex: 1,
    backgroundColor: '#030712',
  },
  readerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  readerCloseBtn: {
    padding: 6,
  },
  readerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  readerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerScroll: {
    padding: 24,
    paddingBottom: 50,
  },
  readerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 255, 224, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  readerTagText: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '700',
  },
  readerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 18,
  },
  readerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#00FFE0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitial: {
    color: '#00FFE0',
    fontWeight: '800',
    fontSize: 16,
  },
  readerAuthor: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  readerTimestamp: {
    color: '#64748B',
    fontSize: 12,
  },
  readerSource: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  readerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  readerCallout: {
    color: '#00FFE0',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    backgroundColor: '#0B0F19',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00FFE0',
    marginBottom: 22,
  },
  readerParagraph: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 18,
  },
  verifiedArticleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    padding: 16,
    marginTop: 20,
  },
  verifiedTitle: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
});
