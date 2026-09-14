import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { useAuth } from '../../context/AuthContext';
import { GlowButton } from '../../components/GlowButton';

export const QuizScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, updateGobxPoints, language } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);
  const [pointsEarnedTotal, setPointsEarnedTotal] = useState(0);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  // Countdown timer per question
  useEffect(() => {
    let interval: any = null;
    if (timerActive && !isAnswered && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      // Time up! Auto-mark question as answered with timeout
      setIsAnswered(true);
      setStreak(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, isAnswered, timeLeft]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      const addedPoints = currentQ.points;
      setScore((prev) => prev + addedPoints);
      setStreak((prev) => prev + 1);
      setPointsEarnedTotal((prev) => prev + addedPoints);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(20);
    } else {
      setQuizFinished(true);
      updateGobxPoints(pointsEarnedTotal);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(20);
    setPointsEarnedTotal(0);
    setQuizFinished(false);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.headerSubtitle}>
              {language === 'vi' ? 'Học & Kiếm thưởng' : 'Learn & Earn'}
            </Text>
            <Text style={styles.headerTitle}>
              {language === 'vi' ? 'Đố Vui Crypto' : 'Crypto Quiz Arena'}
            </Text>
          </View>

          <View style={styles.pointsBadge}>
            <Ionicons name="sparkles" size={16} color="#00FFE0" />
            <Text style={styles.pointsText}>{score} PTS</Text>
          </View>
        </View>

        {/* Quiz Progress & Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>QUESTION</Text>
            <Text style={styles.statValue}>
              {currentIndex + 1}/{QUIZ_QUESTIONS.length}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>STREAK</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="flame" size={16} color="#EF4444" />
              <Text style={styles.statValue}>{streak}x</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TIMER</Text>
            <Text
              style={[
                styles.statValue,
                { color: timeLeft <= 5 ? '#EF4444' : '#00FFE0' },
              ]}
            >
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Timer Bar indicator */}
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerProgress,
              {
                width: `${(timeLeft / 20) * 100}%`,
                backgroundColor: timeLeft <= 5 ? '#EF4444' : '#00E676',
              },
            ]}
          />
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionMetaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{currentQ.category}</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{currentQ.difficulty}</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQ.question}</Text>

          {/* Option Buttons */}
          <View style={styles.optionsList}>
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optionStyle = styles.optionNormal;
              let optionTextStyle = styles.optionTextNormal;
              let optionIcon = null;

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = styles.optionCorrect;
                  optionTextStyle = styles.optionTextCorrect;
                  optionIcon = (
                    <Ionicons name="checkmark-circle" size={20} color="#00E676" />
                  );
                } else if (isSelected && !isCorrect) {
                  optionStyle = styles.optionWrong;
                  optionTextStyle = styles.optionTextWrong;
                  optionIcon = (
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  );
                }
              } else if (isSelected) {
                optionStyle = styles.optionSelected;
              }

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionBase, optionStyle]}
                  activeOpacity={isAnswered ? 1 : 0.7}
                  onPress={() => handleSelectOption(idx)}
                >
                  <View style={styles.optionIndexCircle}>
                    <Text style={styles.optionIndexLetter}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionTextBase, optionTextStyle]}>
                    {option}
                  </Text>
                  {optionIcon}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation Box appears after answering */}
          {isAnswered && (
            <View style={styles.explanationBox}>
              <View style={styles.explanationHeader}>
                <Ionicons
                  name={
                    selectedOption === currentQ.correctIndex
                      ? 'bulb'
                      : 'information-circle'
                  }
                  size={18}
                  color="#00FFE0"
                />
                <Text style={styles.explanationTitle}>Protocol Note:</Text>
              </View>
              <Text style={styles.explanationText}>{currentQ.explanation}</Text>
            </View>
          )}

          {/* Next / Submit Button */}
          {isAnswered && (
            <GlowButton
              title={
                currentIndex < QUIZ_QUESTIONS.length - 1
                  ? language === 'vi'
                    ? 'Câu hỏi tiếp theo'
                    : 'Next Question'
                  : language === 'vi'
                  ? 'Xem kết quả'
                  : 'View Results'
              }
              onPress={handleNextQuestion}
              style={{ marginTop: 16, marginBottom: 4 }}
            />
          )}
        </View>
      </ScrollView>

      {/* Completion Modal */}
      <Modal
        visible={quizFinished}
        transparent={true}
        animationType="fade"
        onRequestClose={handleRestartQuiz}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={48} color="#00FFE0" />
            </View>

            <Text style={styles.modalResultTitle}>Quiz Completed!</Text>
            <Text style={styles.modalResultSub}>
              You proved your crypto knowledge and boosted your Web3 rank.
            </Text>

            <View style={styles.finalScoreBox}>
              <View style={styles.finalStatItem}>
                <Text style={styles.finalStatNum}>{score}</Text>
                <Text style={styles.finalStatLabel}>Score</Text>
              </View>
              <View style={styles.finalDivider} />
              <View style={styles.finalStatItem}>
                <Text style={styles.finalStatNum}>+{pointsEarnedTotal}</Text>
                <Text style={styles.finalStatLabel}>GOBX Tokens</Text>
              </View>
            </View>

            <GlowButton
              title={language === 'vi' ? 'Chơi lại' : 'Play Again'}
              onPress={handleRestartQuiz}
              style={{ width: '100%', marginVertical: 12 }}
            />
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    color: '#00FFE0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 224, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.35)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  pointsText: {
    color: '#00FFE0',
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0B0F19',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  timerTrack: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  timerProgress: {
    height: '100%',
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: '#0B0F19',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 255, 224, 0.25)',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00FFE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 32px rgba(0, 255, 224, 0.12)',
        }
      : {}),
  },
  questionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 255, 224, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#00FFE0',
    fontSize: 11,
    fontWeight: '700',
  },
  difficultyBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
    marginBottom: 14,
  },
  optionBase: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.2,
  },
  optionNormal: {
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionSelected: {
    backgroundColor: 'rgba(0, 255, 224, 0.1)',
    borderColor: '#00FFE0',
  },
  optionCorrect: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: '#00E676',
  },
  optionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  optionIndexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndexLetter: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  optionTextBase: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  optionTextNormal: {
    color: '#E2E8F0',
  },
  optionTextCorrect: {
    color: '#00E676',
    fontWeight: '700',
  },
  optionTextWrong: {
    color: '#F87171',
  },
  explanationBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 224, 0.25)',
    padding: 14,
    marginTop: 8,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  explanationTitle: {
    color: '#00FFE0',
    fontSize: 13,
    fontWeight: '700',
  },
  explanationText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00FFE0',
    padding: 26,
    alignItems: 'center',
  },
  trophyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 255, 224, 0.1)',
    borderWidth: 2,
    borderColor: '#00FFE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalResultTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalResultSub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  finalScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#0B0F19',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  finalStatItem: {
    alignItems: 'center',
  },
  finalStatNum: {
    color: '#00FFE0',
    fontSize: 26,
    fontWeight: '900',
  },
  finalStatLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  finalDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
