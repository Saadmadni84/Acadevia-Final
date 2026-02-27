package com.acadevia.locale.service;

import com.acadevia.locale.entity.Language;
import com.acadevia.locale.entity.LanguageStateMapping;
import com.acadevia.locale.entity.TranslationKey;
import com.acadevia.locale.enums.*;
import com.acadevia.locale.repository.LanguageRepository;
import com.acadevia.locale.repository.LanguageStateMappingRepository;
import com.acadevia.locale.repository.TranslationKeyRepository;
import com.acadevia.locale.util.ScriptDetector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializerService {

    private final LanguageRepository languageRepo;
    private final TranslationKeyRepository keyRepo;
    private final LanguageStateMappingRepository stateMappingRepo;

    @Value("${acadevia.locale.auto-init:true}")
    private boolean autoInit;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initialize() {
        if (!autoInit) return;

        initializeLanguages();
        initializeStateMappings();
        initializeTranslationKeys();
    }

    private void initializeLanguages() {
        if (languageRepo.count() > 0) return;
        log.info("Initializing languages...");

        List<Language> languages = List.of(
                lang("en", "English", "English", "Latin", TextDirection.LTR, LanguagePhase.PHASE_1),
                lang("hi", "Hindi", "हिन्दी", "Devanagari", TextDirection.LTR, LanguagePhase.PHASE_1),
                lang("ta", "Tamil", "தமிழ்", "Tamil", TextDirection.LTR, LanguagePhase.PHASE_1),
                lang("te", "Telugu", "తెలుగు", "Telugu", TextDirection.LTR, LanguagePhase.PHASE_1),
                lang("bn", "Bengali", "বাংলা", "Bengali", TextDirection.LTR, LanguagePhase.PHASE_1),
                lang("mr", "Marathi", "मराठी", "Devanagari", TextDirection.LTR, LanguagePhase.PHASE_2),
                lang("gu", "Gujarati", "ગુજરાતી", "Gujarati", TextDirection.LTR, LanguagePhase.PHASE_2),
                lang("kn", "Kannada", "ಕನ್ನಡ", "Kannada", TextDirection.LTR, LanguagePhase.PHASE_2),
                lang("ml", "Malayalam", "മലയാളം", "Malayalam", TextDirection.LTR, LanguagePhase.PHASE_2),
                lang("pa", "Punjabi", "ਪੰਜਾਬੀ", "Gurmukhi", TextDirection.LTR, LanguagePhase.PHASE_2),
                lang("or", "Odia", "ଓଡ଼ିଆ", "Odia", TextDirection.LTR, LanguagePhase.PHASE_2),
                lang("ur", "Urdu", "اردو", "Nastaliq", TextDirection.RTL, LanguagePhase.PHASE_3),
                lang("as", "Assamese", "অসমীয়া", "Bengali", TextDirection.LTR, LanguagePhase.PHASE_3)
        );

        languageRepo.saveAll(languages);
        log.info("Initialized {} languages", languages.size());
    }

    private void initializeStateMappings() {
        if (stateMappingRepo.count() > 0) return;
        log.info("Initializing state-language mappings...");

        List<LanguageStateMapping> mappings = List.of(
                stateMap("MH", "Maharashtra", "mr", "hi,en"),
                stateMap("TN", "Tamil Nadu", "ta", "en"),
                stateMap("AP", "Andhra Pradesh", "te", "en"),
                stateMap("TS", "Telangana", "te", "en,ur"),
                stateMap("WB", "West Bengal", "bn", "en,hi"),
                stateMap("KA", "Karnataka", "kn", "en"),
                stateMap("KL", "Kerala", "ml", "en"),
                stateMap("GJ", "Gujarat", "gu", "hi,en"),
                stateMap("PB", "Punjab", "pa", "hi,en"),
                stateMap("OD", "Odisha", "or", "en,hi"),
                stateMap("AS", "Assam", "as", "en,bn"),
                stateMap("UP", "Uttar Pradesh", "hi", "en,ur"),
                stateMap("MP", "Madhya Pradesh", "hi", "en"),
                stateMap("RJ", "Rajasthan", "hi", "en"),
                stateMap("BR", "Bihar", "hi", "en"),
                stateMap("JH", "Jharkhand", "hi", "en"),
                stateMap("CG", "Chhattisgarh", "hi", "en"),
                stateMap("HR", "Haryana", "hi", "en"),
                stateMap("UK", "Uttarakhand", "hi", "en"),
                stateMap("HP", "Himachal Pradesh", "hi", "en"),
                stateMap("JK", "Jammu & Kashmir", "ur", "hi,en"),
                stateMap("DL", "Delhi", "hi", "en,pa,ur"),
                stateMap("GA", "Goa", "kok", "mr,en"),
                stateMap("MN", "Manipur", "mni", "en"),
                stateMap("TR", "Tripura", "bn", "en"),
                stateMap("ML", "Meghalaya", "en", "hi"),
                stateMap("SK", "Sikkim", "ne", "en"),
                stateMap("NL", "Nagaland", "en", "hi"),
                stateMap("MZ", "Mizoram", "en", "hi"),
                stateMap("AR", "Arunachal Pradesh", "en", "hi")
        );

        stateMappingRepo.saveAll(mappings);
        log.info("Initialized {} state mappings", mappings.size());
    }

    private void initializeTranslationKeys() {
        if (keyRepo.count() > 0) return;
        log.info("Initializing translation keys...");

        List<TranslationKey> keys = List.of(
                // Landing Page
                key("landing.hero.title", TranslationCategory.UI_LABELS, "Learn Through Gaming"),
                key("landing.hero.subtitle", TranslationCategory.UI_LABELS, "Join millions of students learning with fun games and quizzes"),
                key("landing.cta.start", TranslationCategory.UI_LABELS, "Start Learning"),
                key("landing.cta.demo", TranslationCategory.UI_LABELS, "Watch Demo"),
                key("landing.stats.students", TranslationCategory.UI_LABELS, "Total Students"),
                key("landing.stats.active", TranslationCategory.UI_LABELS, "Active Today"),
                key("landing.stats.completed", TranslationCategory.UI_LABELS, "Courses Completed"),
                key("landing.stats.avgScore", TranslationCategory.UI_LABELS, "Average Score"),
                key("landing.why.badges", TranslationCategory.UI_LABELS, "Achievements & Badges"),
                key("landing.why.analytics", TranslationCategory.UI_LABELS, "Progress Analytics"),
                key("landing.why.social", TranslationCategory.UI_LABELS, "Social Learning"),
                key("landing.why.personalized", TranslationCategory.UI_LABELS, "Personalized Paths"),
                key("landing.why.interactive", TranslationCategory.UI_LABELS, "Interactive Content"),
                key("landing.why.certified", TranslationCategory.UI_LABELS, "Certified Learning"),

                // Auth
                key("auth.login", TranslationCategory.UI_LABELS, "Login"),
                key("auth.register", TranslationCategory.UI_LABELS, "Register"),
                key("auth.email", TranslationCategory.UI_LABELS, "Email Address"),
                key("auth.password", TranslationCategory.UI_LABELS, "Password"),
                key("auth.forgot", TranslationCategory.UI_LABELS, "Forgot Password?"),
                key("auth.createAccount", TranslationCategory.UI_LABELS, "Create Account"),

                // Onboarding
                key("onboarding.selectLanguage", TranslationCategory.ONBOARDING, "Select Your Language"),
                key("onboarding.selectState", TranslationCategory.ONBOARDING, "Select Your State"),
                key("onboarding.selectCity", TranslationCategory.ONBOARDING, "Select Your City"),
                key("onboarding.selectSchool", TranslationCategory.ONBOARDING, "Select Your School"),
                key("onboarding.enterStudentId", TranslationCategory.ONBOARDING, "Enter Your Student ID"),
                key("onboarding.enterClassroom", TranslationCategory.ONBOARDING, "Enter Your Classroom"),
                key("onboarding.welcome", TranslationCategory.ONBOARDING, "Welcome to Acadevia!"),

                // Dashboard
                key("dashboard.myProgress", TranslationCategory.UI_LABELS, "My Progress"),
                key("dashboard.myCourses", TranslationCategory.UI_LABELS, "My Courses"),
                key("dashboard.myGames", TranslationCategory.UI_LABELS, "My Games"),
                key("dashboard.leaderboard", TranslationCategory.UI_LABELS, "Leaderboard"),
                key("dashboard.badges", TranslationCategory.UI_LABELS, "Badges"),
                key("dashboard.streak", TranslationCategory.UI_LABELS, "Daily Streak"),
                key("dashboard.xp", TranslationCategory.UI_LABELS, "Experience Points"),
                key("dashboard.wallet", TranslationCategory.UI_LABELS, "Wallet"),

                // Notifications
                key("notification.badge.unlocked", TranslationCategory.NOTIFICATIONS, "🏆 Congratulations! You earned the '{badgeName}' badge!"),
                key("notification.streak.milestone", TranslationCategory.NOTIFICATIONS, "🔥 Amazing! {days}-day learning streak!"),
                key("notification.streak.broken", TranslationCategory.NOTIFICATIONS, "💔 Your {previousStreak}-day streak was broken. Start again!"),
                key("notification.streak.warning", TranslationCategory.NOTIFICATIONS, "⚠️ Your streak expires in {hours} hours! Open Acadevia now."),
                key("notification.leaderboard.rank.up", TranslationCategory.NOTIFICATIONS, "📈 You moved up to Rank #{newRank} in {scope} leaderboard!"),
                key("notification.leaderboard.rank.down", TranslationCategory.NOTIFICATIONS, "📉 You dropped to Rank #{newRank}. Keep practicing!"),
                key("notification.course.completed", TranslationCategory.NOTIFICATIONS, "🎓 You completed '{courseName}'! +{xpAwarded} XP"),
                key("notification.quiz.completed", TranslationCategory.NOTIFICATIONS, "✅ Quiz scored: {score}/{maxScore} ({accuracy}% accuracy)"),
                key("notification.game.completed", TranslationCategory.NOTIFICATIONS, "🎮 Game won! +{xpEarned} XP, +{creditsEarned} credits"),
                key("notification.classroom.announcement", TranslationCategory.NOTIFICATIONS, "📢 {teacherName}: {title}"),
                key("notification.classroom.assignment", TranslationCategory.NOTIFICATIONS, "📝 New assignment: {title} (Due: {dueDate})"),
                key("notification.wallet.credited", TranslationCategory.NOTIFICATIONS, "💰 {amount} credits added! Balance: {balance}"),
                key("notification.system.welcome", TranslationCategory.NOTIFICATIONS, "🎉 Welcome to Acadevia, {name}! Start your learning journey."),
                key("notification.xp.daily.summary", TranslationCategory.NOTIFICATIONS, "📊 Today you earned {totalXp} XP across {activities} activities!"),

                // Errors
                key("error.generic", TranslationCategory.ERRORS, "Something went wrong. Please try again."),
                key("error.network", TranslationCategory.ERRORS, "Network error. Please check your connection."),
                key("error.unauthorized", TranslationCategory.ERRORS, "You are not authorized to perform this action."),
                key("error.notFound", TranslationCategory.ERRORS, "The requested resource was not found."),
                key("error.validation", TranslationCategory.ERRORS, "Please check your input and try again."),

                // Common
                key("common.submit", TranslationCategory.UI_LABELS, "Submit"),
                key("common.cancel", TranslationCategory.UI_LABELS, "Cancel"),
                key("common.save", TranslationCategory.UI_LABELS, "Save"),
                key("common.delete", TranslationCategory.UI_LABELS, "Delete"),
                key("common.edit", TranslationCategory.UI_LABELS, "Edit"),
                key("common.search", TranslationCategory.UI_LABELS, "Search"),
                key("common.loading", TranslationCategory.UI_LABELS, "Loading..."),
                key("common.next", TranslationCategory.UI_LABELS, "Next"),
                key("common.previous", TranslationCategory.UI_LABELS, "Previous"),
                key("common.back", TranslationCategory.UI_LABELS, "Back"),
                key("common.home", TranslationCategory.UI_LABELS, "Home"),
                key("common.settings", TranslationCategory.UI_LABELS, "Settings"),
                key("common.profile", TranslationCategory.UI_LABELS, "Profile"),
                key("common.logout", TranslationCategory.UI_LABELS, "Logout"),
                key("common.viewAll", TranslationCategory.UI_LABELS, "View All"),
                key("common.noData", TranslationCategory.UI_LABELS, "No data available")
        );

        keyRepo.saveAll(keys);
        log.info("Initialized {} translation keys", keys.size());
    }

    private Language lang(String code, String name, String nativeName, String script, TextDirection dir, LanguagePhase phase) {
        return Language.builder()
                .code(code).name(name).nativeName(nativeName).script(script)
                .direction(dir).fontFamily(ScriptDetector.getFontFamily(code)).phase(phase).isActive(true)
                .build();
    }

    private LanguageStateMapping stateMap(String code, String name, String primary, String secondary) {
        return LanguageStateMapping.builder()
                .stateCode(code).stateName(name).primaryLanguageCode(primary)
                .secondaryLanguageCodes(secondary).officialLanguageCode("en")
                .build();
    }

    private TranslationKey key(String keyName, TranslationCategory cat, String defaultValue) {
        return TranslationKey.builder()
                .keyName(keyName).category(cat).defaultValue(defaultValue)
                .build();
    }
}
