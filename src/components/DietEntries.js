import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Badge } from './ui/Badge';
import { Apple, BarChart3, Clock, Scale, Utensils, Target, Zap, Droplets, TrendingUp, Award } from 'lucide-react';

const DietEntries = ({ entries, formatMealType, formatTime }) => {
  // Calculate daily totals from entries
  const calculateNutritionTotals = () => {
    if (!entries || entries.length === 0) return null;
    
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fat: totals.fat + (entry.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Daily goals (these could come from user preferences)
  const dailyGoals = {
    calories: 2000,
    protein: 150, // grams
    carbs: 250,   // grams  
    fat: 67       // grams
  };

  const nutritionTotals = calculateNutritionTotals();

  // Enhanced Progress bar component
  const ProgressBar = ({ label, current, goal, unit, color, icon: Icon }) => {
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    const isComplete = percentage >= 100;
    const isCloseToGoal = percentage >= 80 && percentage < 100;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg ${color.replace('text-', 'bg-').replace('-400', '-500/20')} flex items-center justify-center`}>
              <Icon className={`w-3 h-3 ${color}`} />
            </div>
            <span className="text-xs md:text-sm font-medium text-text-primary">{label}</span>
          </div>
          <div className="text-right">
            <div className="text-xs md:text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{Math.round(current)}</span>
              <span className="text-text-muted">/{goal}{unit}</span>
            </div>
            <div className="text-xs text-text-muted">{Math.round(percentage)}% of goal</div>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-glass-medium/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${color.replace('text-', 'bg-').replace('-400', '-500')} relative`}
              style={{ width: `${percentage}%` }}
            >
              {/* Shimmer effect for active progress */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          {/* Achievement badges */}
          {isComplete && (
            <div className="absolute right-0 -top-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-bold text-blue-400">Goal Achieved!</span>
            </div>
          )}
          {isCloseToGoal && !isComplete && (
            <div className="absolute right-0 -top-1">
              <span className="text-xs font-medium text-orange-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Almost there!
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!nutritionTotals) return 0;
    const avgProgress = [
      (nutritionTotals.calories / dailyGoals.calories) * 100,
      (nutritionTotals.protein / dailyGoals.protein) * 100,
      (nutritionTotals.carbs / dailyGoals.carbs) * 100,
      (nutritionTotals.fat / dailyGoals.fat) * 100
    ].reduce((a, b) => a + b, 0) / 4;
    return Math.min(avgProgress, 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-5 md:space-y-6">
      <Card className="glass-card animate-fade-in-up">
        {/* Header Section */}
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-glow">
              <Apple className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base md:text-lg text-text-primary">Today's Nutrition</CardTitle>
              <CardDescription className="text-xs md:text-sm text-text-muted">Track your progress toward your daily goals</CardDescription>
            </div>
            {/* Overall Progress Circle */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth="2"
                    strokeDasharray={`${overallProgress}, 100`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">{Math.round(overallProgress)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 md:space-y-6">
          {/* Nutrition Progress Section */}
          {nutritionTotals ? (
            <div className="space-y-5">
              {/* Progress Bars */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                  Daily Progress
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  <ProgressBar
                    label="Calories"
                    current={nutritionTotals.calories}
                    goal={dailyGoals.calories}
                    unit=" cal"
                    color="text-orange-400"
                    icon={Zap}
                  />
                  <ProgressBar
                    label="Protein"
                    current={nutritionTotals.protein}
                    goal={dailyGoals.protein}
                    unit="g"
                    color="text-blue-400"
                    icon={Target}
                  />
                  <ProgressBar
                    label="Carbs"
                    current={nutritionTotals.carbs}
                    goal={dailyGoals.carbs}
                    unit="g"
                    color="text-blue-400"
                    icon={Droplets}
                  />
                  <ProgressBar
                    label="Fat"
                    current={nutritionTotals.fat}
                    goal={dailyGoals.fat}
                    unit="g"
                    color="text-amber-400"
                    icon={Scale}
                  />
                </div>
              </div>

              {/* Motivational tip */}
              <div className="bg-glass-medium/50 rounded-lg md:rounded-xl p-3 md:p-4 border border-glass-border">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-text-primary mb-1">Daily Insight</h4>
                    <p className="text-xs text-text-secondary">
                      {nutritionTotals.calories < dailyGoals.calories * 0.5 
                        ? "Great start! Keep logging your meals to reach your goals 🌟"
                        : nutritionTotals.calories < dailyGoals.calories * 0.8
                        ? "You're making good progress! Almost at your daily target 💪"
                        : overallProgress >= 90
                        ? "Excellent! You're crushing your nutrition goals today 🎉"
                        : "You're right on track with your nutrition goals 👍"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-6 md:py-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-glass-medium/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Utensils className="w-6 h-6 md:w-8 md:h-8 text-text-muted/50" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-text-primary mb-2">No meals logged yet</h3>
              <p className="text-xs md:text-sm text-text-muted max-w-sm mx-auto">
                Start your nutrition tracking by telling your AI nutritionist about your meals!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entries Grid */}
      {entries && entries.length > 0 && (
        <Card className="glass-card animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-glow">
                <Utensils className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg text-text-primary">Meal History</CardTitle>
                <CardDescription className="text-xs md:text-sm text-text-muted">{entries.length} meals logged today</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {entries.map((entry, index) => (
                <Card 
                  key={`entry-${entry.id || index}`} 
                  className="p-3 md:p-4 hover:bg-glass-medium/70 transition-all duration-300 animate-scale-in bg-glass-medium/50 border-glass-border hover:border-glass-border-hover hover:shadow-modern-lg group hover:-translate-y-1"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <CardContent className="p-0">
                    {/* Food Header */}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-sm group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                        <Utensils className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs md:text-sm font-semibold text-text-primary leading-tight mb-1 truncate">
                          {entry.food_name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/30 transition-colors text-xs"
                        >
                          {formatMealType(entry.meal_type)}
                        </Badge>
                      </div>
                    </div>

                    {/* Nutrition Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-glass-dark/30 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Scale className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-text-muted">Amount</span>
                        </div>
                        <span className="text-xs font-medium text-text-primary">
                          {entry.quantity} {entry.unit}
                        </span>
                      </div>
                      <div className="bg-glass-dark/30 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-text-muted">Calories</span>
                        </div>
                        <span className="text-xs font-medium text-text-primary">
                          {entry.calories ? `${Math.round(entry.calories)}` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-glass-border">
                      <div className="flex items-center gap-1 text-text-muted">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(entry.meal_time)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>Logged</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DietEntries; 