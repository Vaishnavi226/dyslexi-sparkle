import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Star, Award, Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';

const avatarOptions = ['🎓', '🌟', '🦄', '🎈', '🎨', '📚', '🌈', '🚀', '🎪', '🎵', '🐾', '🌺'];

const badgeIcons: { [key: string]: string } = {
  'First Steps': '👶',
  'Word Master': '📝',
  'Voice Champion': '🎤',
  'Speed Reader': '⚡',
  'Spelling Bee': '🐝',
  'Star Student': '⭐',
  'Perfect Score': '💯',
  'Daily Learner': '📅',
  'Problem Solver': '🧩',
  'Creative Mind': '🎨'
};

const Profile: React.FC = () => {
  const { userProfile, userProgress, updateProfile } = useGame();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleSave = () => {
    updateProfile(tempProfile);
    setEditMode(false);
    toast({
      title: "Profile Updated! 🎉",
      description: "Your profile has been saved successfully.",
    });
  };

  const handleCancel = () => {
    setTempProfile(userProfile);
    setEditMode(false);
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">My Profile</h1>
            </div>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "outline" : "default"}
            >
              <Settings className="w-4 h-4 mr-2" />
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Selection */}
                  <div className="text-center">
                    <div className="text-6xl mb-4">{tempProfile.avatar}</div>
                    {editMode && (
                      <div className="grid grid-cols-6 gap-2">
                        {avatarOptions.map((avatar, index) => (
                          <button
                            key={index}
                            onClick={() => setTempProfile({ ...tempProfile, avatar })}
                            className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                              tempProfile.avatar === avatar
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Name</Label>
                    {editMode ? (
                      <Input
                        id="name"
                        value={tempProfile.name}
                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-muted rounded-md">{userProfile.name}</div>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <Label htmlFor="age">Age</Label>
                    {editMode ? (
                      <Input
                        id="age"
                        type="number"
                        min="3"
                        max="18"
                        value={tempProfile.age}
                        onChange={(e) => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || 8 })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-muted rounded-md">{userProfile.age} years old</div>
                    )}
                  </div>

                  {/* Level & XP */}
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Level {userProgress.overall.level}</span>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {userProgress.overall.xp} XP
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(userProgress.overall.xp % 100)}%` }}
                      />
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Font Selection */}
                  <div>
                    <Label>Preferred Font</Label>
                    {editMode ? (
                      <Select
                        value={tempProfile.preferredFont}
                        onValueChange={(value: 'default' | 'opendyslexic' | 'atkinson') =>
                          setTempProfile({ ...tempProfile, preferredFont: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                          <SelectItem value="atkinson">Atkinson Hyperlegible</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 p-2 bg-muted rounded-md capitalize">{userProfile.preferredFont}</div>
                    )}
                  </div>

                  {/* Font Size */}
                  <div>
                    <Label>Font Size</Label>
                    {editMode ? (
                      <Select
                        value={tempProfile.fontSize}
                        onValueChange={(value: 'small' | 'medium' | 'large') =>
                          setTempProfile({ ...tempProfile, fontSize: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 p-2 bg-muted rounded-md capitalize">{userProfile.fontSize}</div>
                    )}
                  </div>

                  {/* TTS Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tts">Text-to-Speech</Label>
                      <Switch
                        id="tts"
                        checked={editMode ? tempProfile.ttsEnabled : userProfile.ttsEnabled}
                        onCheckedChange={(checked) =>
                          editMode && setTempProfile({ ...tempProfile, ttsEnabled: checked })
                        }
                        disabled={!editMode}
                      />
                    </div>

                    {(editMode ? tempProfile.ttsEnabled : userProfile.ttsEnabled) && (
                      <>
                        <div>
                          <Label>Speech Rate</Label>
                          {editMode ? (
                            <Slider
                              value={[tempProfile.ttsRate]}
                              onValueChange={(value) =>
                                setTempProfile({ ...tempProfile, ttsRate: value[0] })
                              }
                              max={2}
                              min={0.5}
                              step={0.1}
                              className="mt-2"
                            />
                          ) : (
                            <div className="mt-1 p-2 bg-muted rounded-md">{userProfile.ttsRate}x</div>
                          )}
                        </div>

                        <div>
                          <Label>Speech Volume</Label>
                          {editMode ? (
                            <Slider
                              value={[tempProfile.ttsVolume]}
                              onValueChange={(value) =>
                                setTempProfile({ ...tempProfile, ttsVolume: value[0] })
                              }
                              max={1}
                              min={0}
                              step={0.1}
                              className="mt-2"
                            />
                          ) : (
                            <div className="mt-1 p-2 bg-muted rounded-md">{Math.round(userProfile.ttsVolume * 100)}%</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="soundfx">Sound Effects</Label>
                    <Switch
                      id="soundfx"
                      checked={editMode ? tempProfile.soundFxEnabled : userProfile.soundFxEnabled}
                      onCheckedChange={(checked) =>
                        editMode && setTempProfile({ ...tempProfile, soundFxEnabled: checked })
                      }
                      disabled={!editMode}
                    />
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contrast">High Contrast</Label>
                    <Switch
                      id="contrast"
                      checked={editMode ? tempProfile.highContrast : userProfile.highContrast}
                      onCheckedChange={(checked) =>
                        editMode && setTempProfile({ ...tempProfile, highContrast: checked })
                      }
                      disabled={!editMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {userProgress.overall.badges.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Badges Earned</div>
                    </div>

                    {userProgress.overall.badges.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {userProgress.overall.badges.map((badge, index) => (
                          <motion.div
                            key={badge}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 p-3 rounded-lg text-center border border-yellow-300/50"
                          >
                            <div className="text-2xl mb-1">{badgeIcons[badge] || '🏆'}</div>
                            <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                              {badge}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No badges yet!</p>
                        <p className="text-sm">Start learning to earn your first badge.</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-500">
                          {userProgress.overall.streak}
                        </div>
                        <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;