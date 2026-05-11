import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Animated
} from 'react-native';
import {
  Search,
  TrendingUp,
  Users,
  Hash,
  X,
  MapPin,
  ArrowLeft
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/src/components/common/AppText';
import AppAvatar from '@/src/components/common/AppAvatar';
import PostCard from '@/src/components/social/PostCard';
import { Colors, Shadow } from '@/src/constants/theme';
import { socialApi } from '@/src/api/socialApi';
import debounce from 'lodash/debounce';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'posts', label: 'Bài viết' },
  { id: 'people', label: 'Người dùng' },
  { id: 'tags', label: 'Hashtag' }
];

const MOCK_TRENDING_TAGS = [
  { name: 'DuLichVietNam', display_name: 'DuLichVietNam' },
  { name: 'PhuQuoc', display_name: 'PhuQuoc' },
  { name: 'HaGiangLoop', display_name: 'HaGiangLoop' },
  { name: 'AmThuc', display_name: 'AmThuc' },
  { name: 'CheckinVietnam', display_name: 'CheckinVietnam' },
  { name: 'SaPa', display_name: 'SaPa' },
];

const SkeletonItem = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
        <View style={styles.skeletonInfo}>
          <Animated.View style={[styles.skeletonLine, { width: '40%', opacity }]} />
          <Animated.View style={[styles.skeletonLine, { width: '25%', height: 10, marginTop: 6, opacity }]} />
        </View>
      </View>
      <Animated.View style={[styles.skeletonContent, { opacity }]} />
      <Animated.View style={[styles.skeletonMedia, { opacity }]} />
    </View>
  );
};

function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async () => {
    try {
      const response = await socialApi.getSuggestedUsers();
      if (response.success) {
        setSuggestedUsers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading suggested users:', error);
    }
  };

  const handleSearch = async (query, tab = activeTab) => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
    try {
      if (tab === 'all') {
        const response = await socialApi.searchAll(query);
        if (response.success) {
          setResults(response.data.merged || []);
        }
      } else if (tab === 'posts') {
        const response = await socialApi.searchPosts(query);
        if (response.success) {
          setResults(response.data.data || []);
        }
      } else if (tab === 'people') {
        const response = await socialApi.searchUsers(query);
        if (response.success) {
          setResults(response.data.data || []);
        }
      } else if (tab === 'tags') {
        const response = await socialApi.searchPosts(null, { tag: query });
        if (response.success) {
          setResults(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => handleSearch(query), 500),
    [activeTab]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setIsSearching(false);
      setResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setResults([]);
    setActiveTab('all');
    Keyboard.dismiss();
  };

  const handleFollow = async (userId) => {
    try {
      const response = await socialApi.toggleFollow(userId);
      if (response.success) {
        loadSuggestedUsers();
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const renderUserItem = ({ item, isSmall = false }) => (
    <View style={isSmall ? styles.userCardSmall : styles.userCard}>
      <AppAvatar src={item.avatar_url} name={item.display_name} size={isSmall ? 40 : 50} />
      <View style={styles.userInfo}>
        <AppText weight="bold" style={isSmall ? styles.userNameSmall : styles.userName}>{item.display_name}</AppText>
        <AppText style={isSmall ? styles.userNicknameSmall : styles.userBio} numberOfLines={1}>
          {isSmall ? `@${item.display_name?.toLowerCase().replace(/\s/g, '')}` : (item.social_profile?.bio || 'Chưa có tiểu sử')}
        </AppText>
      </View>
      <TouchableOpacity
        style={isSmall ? styles.followBtnSmall : styles.followBtn}
        onPress={() => handleFollow(item.id)}
      >
        <AppText weight="bold" style={isSmall ? styles.followBtnTextSmall : styles.followBtnText}>
          Theo dõi
        </AppText>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <AppText weight="bold" style={styles.emptyTitle}>Rất tiếc, không có kết quả</AppText>
      <AppText style={styles.emptyText}>
        Chúng tôi không tìm thấy bất kỳ kết quả nào cho "{searchQuery}". Hãy thử tìm kiếm bằng từ khóa khác hoặc kiểm tra lại chính tả.
      </AppText>
    </View>
  );

  const renderDefaultView = () => (
    <FlatList
      data={[
        { id: 'trending', title: 'Hashtag thịnh hành', type: 'tags' },
        { id: 'suggestions', title: 'Gợi ý cho bạn', type: 'users' }
      ]}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              {item.type === 'tags' ? <TrendingUp size={20} color={Colors.primary} /> : <Users size={20} color={Colors.primary} />}
              <AppText weight="bold" style={styles.sectionTitle}>{item.title}</AppText>
            </View>
          </View>

          {item.type === 'tags' ? (
            <View style={styles.tagCloud}>
              {MOCK_TRENDING_TAGS.map((tag, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tagChip}
                  onPress={() => setSearchQuery(tag.name)}
                >
                  <AppText style={styles.tagChipText}>#{tag.display_name}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.suggestionsList}>
              {suggestedUsers.length > 0 ? (
                suggestedUsers.map((user, idx) => (
                  <React.Fragment key={user.id}>
                    {renderUserItem({ item: user, isSmall: true })}
                    {idx < suggestedUsers.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <AppText style={{ color: Colors.textSecondary }}>Không có gợi ý mới</AppText>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    />
  );

  const renderResultItem = ({ item }) => {
    // If merged results have result_type
    if (item.result_type === 'user' || (!item.content && item.display_name)) {
      return renderUserItem({ item });
    }
    return <PostCard post={item} />;
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <AppText weight="bold" style={styles.screenTitle}>Tìm kiếm</AppText>

        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài viết, người dùng..."
              placeholderTextColor="#A0AEC0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        {isSearching && (
          <View style={styles.tabs}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => {
                  setActiveTab(tab.id);
                  handleSearch(searchQuery, tab.id);
                }}
              >
                <AppText
                  weight={activeTab === tab.id ? "bold" : "medium"}
                  style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {!isSearching ? (
          renderDefaultView()
        ) : isLoading ? (
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={i => i.toString()}
            renderItem={() => <SkeletonItem />}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderResultItem}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={isLoading}
            onRefresh={() => handleSearch(searchQuery)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  screenTitle: {
    fontSize: 30,
    color: Colors.text,
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Quicksand-Medium',
    fontSize: 15,
    color: Colors.text
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 5,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  contentArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.text
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tagChipText: {
    color: Colors.text,
    fontSize: 14,
  },
  suggestionsList: {
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userCardSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16
  },
  userName: {
    fontSize: 16,
    color: Colors.text
  },
  userBio: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userNameSmall: {
    fontSize: 15,
    color: Colors.text,
  },
  userNicknameSmall: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25
  },
  followBtnSmall: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 13
  },
  followBtnTextSmall: {
    color: Colors.primary,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonContent: {
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonMedia: {
    height: 180,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
});

export default ExploreScreen;
