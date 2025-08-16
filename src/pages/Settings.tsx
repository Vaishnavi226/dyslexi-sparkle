import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Volume2, 
  Eye, 
  Palette,
  Rocket,
  Star,
  Brain,
  Zap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/shared/Layout';
import { useGame } from '@/contexts/GameContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { SpeechUtils } from '@/utils/speechUtils';

const Settings: React.FC = () => {
  const { userProfile, updateProfile } = useGame();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [isLoading, setIsLoading] = useState(false);

  // Apply font changes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font family
    switch (tempProfile.preferredFont) {
      case 'opendyslexic':
        root.style.setProperty('--font-family', '"OpenDyslexic", sans-serif');
        break;
      case 'atkinson':
        root.style.setProperty('--font-family', '"Atkinson Hyperlegible", sans-serif');
        break;
      default:
        root.style.setProperty('--font-family', 'system-ui, sans-serif');
    }
    
    // Apply font size
    const sizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', sizeMap[tempProfile.fontSize]);
    
    // Apply high contrast
    if (tempProfile.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [tempProfile.preferredFont, tempProfile.fontSize, tempProfile.highContrast]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      updateProfile(tempProfile);
      
      // Simulate save delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "🚀 Settings Saved!",
        description: "Your cosmic preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTempProfile(userProfile);
    toast({
      title: "🔄 Settings Reset",
      description: "All changes have been reverted to your last saved state.",
    });
  };

  const handleTestTTS = () => {
    const testText = "Greetings, space explorer! This is your cosmic text-to-speech system. Ready for your next galactic adventure?";
    SpeechUtils.speak(testText, {
      rate: tempProfile.ttsRate,
      volume: tempProfile.ttsVolume
    });
    
    toast({
      title: "🎵 Testing Voice",
      description: "How does that sound?",
    });
  };

  const exportData = () => {
    const data = {
      profile: userProfile,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-dyslexia-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "📦 Data Exported!",
      description: "Your cosmic journey data has been downloaded successfully.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.profile) {
          updateProfile(data.profile);
          setTempProfile(data.profile);
          toast({
            title: "📥 Data Imported!",
            description: "Your cosmic settings have been restored from the stars.",
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "❌ Import Failed",
          description: "The file format appears to be corrupted or invalid.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const achievements = [
    { icon: <Star className="w-4 h-4" />, title: "Settings Explorer", desc: "Customized your experience" },
    { icon: <Brain className="w-4 h-4" />, title: "Accessibility Advocate", desc: "Optimized for learning" },
    { icon: <Rocket className="w-4 h-4" />, title: "Space Traveler", desc: "Ready for cosmic adventures" }
  ];

  return (
    <Layout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="cosmic-card p-6 rounded-2xl max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <SettingsIcon className="w-12 h-12 text-accent" />
                  <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Cosmic Control Center
              </h1>
              <p className="text-muted-foreground mt-2">
                Customize your galactic learning experience
              </p>
              
              {/* Achievement Badges */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {achievement.icon}
                      <span className="text-xs">{achievement.title}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="cosmic-button"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
              <Button 
                onClick={handleSave} 
                className="cosmic-button"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accessibility Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="cosmic-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-accent" />
                    Visual Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Font Selection */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="font" className="text-sm font-medium">
                        Reading Font
                      </Label>
                      <Select
                        value={tempProfile.preferredFont}
                        onValueChange={(value: 'default' | 'opendyslexic' | 'atkinson') =>
                          setTempProfile({ ...tempProfile, preferredFont: value })
                        }
                      >
                        <SelectTrigger id="font" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Space Font</SelectItem>
                          <SelectItem value="opendyslexic">OpenDyslexic (Dyslexia-Optimized)</SelectItem>
                          <SelectItem value="atkinson">Atkinson Hyperlegible</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose a font that enhances your reading experience
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="fontSize" className="text-sm font-medium">
                        Text Size
                      </Label>
                      <Select
                        value={tempProfile.fontSize}
                        onValueChange={(value: 'small' | 'medium' | 'large') =>
                          setTempProfile({ ...tempProfile, fontSize: value })
                        }
                      >
                        <SelectTrigger id="fontSize" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Compact (14px)</SelectItem>
                          <SelectItem value="medium">Standard (16px)</SelectItem>
                          <SelectItem value="large">Large (18px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Visual Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="contrast" className="text-sm font-medium">
                          High Contrast Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enhanced visibility for better reading
                        </p>
                      </div>
                      <Switch
                        id="contrast"
                        checked={tempProfile.highContrast}
                        onCheckedChange={(checked) =>
                          setTempProfile({ ...tempProfile, highContrast: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="theme" className="text-sm font-medium">
                          Theme Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Current: {theme === 'light' ? 'Light Space' : 'Deep Space'} theme
                        </p>
                      </div>
                      <Button 
                        onClick={toggleTheme} 
                        variant="outline" 
                        size="sm"
                        className="cosmic-button"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Switch Theme
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Audio Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="cosmic-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="w-5 h-5 mr-2 text-accent" />
                    Audio Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Text-to-Speech */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="tts" className="text-sm font-medium">
                          Cosmic Voice Assistant
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Have text narrated by your space companion
                        </p>
                      </div>
                      <Switch
                        id="tts"
                        checked={tempProfile.ttsEnabled}
                        onCheckedChange={(checked) =>
                          setTempProfile({ ...tempProfile, ttsEnabled: checked })
                        }
                      />
                    </div>

                    {tempProfile.ttsEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 p-4 cosmic-card rounded-lg"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Voice Speed</Label>
                            <Badge variant="outline">
                              {tempProfile.ttsRate}x
                            </Badge>
                          </div>
                          <Slider
                            value={[tempProfile.ttsRate]}
                            onValueChange={(value) =>
                              setTempProfile({ ...tempProfile, ttsRate: value[0] })
                            }
                            max={2}
                            min={0.5}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Slow</span>
                            <span>Fast</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Voice Volume</Label>
                            <Badge variant="outline">
                              {Math.round(tempProfile.ttsVolume * 100)}%
                            </Badge>
                          </div>
                          <Slider
                            value={[tempProfile.ttsVolume]}
                            onValueChange={(value) =>
                              setTempProfile({ ...tempProfile, ttsVolume: value[0] })
                            }
                            max={1}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        <Button 
                          onClick={handleTestTTS} 
                          variant="outline" 
                          size="sm" 
                          className="w-full cosmic-button"
                        >
                          <Volume2 className="w-4 h-4 mr-2" />
                          Test Cosmic Voice
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  <Separator />

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="soundfx" className="text-sm font-medium">
                        Galactic Sound Effects
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Space sounds for actions and achievements
                      </p>
                    </div>
                    <Switch
                      id="soundfx"
                      checked={tempProfile.soundFxEnabled}
                      onCheckedChange={(checked) =>
                        setTempProfile({ ...tempProfile, soundFxEnabled: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="cosmic-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="w-5 h-5 mr-2 text-accent" />
                    Mission Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Safely backup and restore your cosmic learning journey data.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={exportData} 
                      variant="outline" 
                      className="cosmic-button h-16 flex-col space-y-1"
                    >
                      <Download className="w-5 h-5" />
                      <div className="text-center">
                        <div className="font-medium">Export Data</div>
                        <div className="text-xs opacity-70">Download your progress</div>
                      </div>
                    </Button>
                    
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                        id="importFile"
                      />
                      <Button asChild variant="outline" className="cosmic-button h-16 w-full flex-col space-y-1">
                        <label htmlFor="importFile" className="cursor-pointer">
                          <Upload className="w-5 h-5" />
                          <div className="text-center">
                            <div className="font-medium">Import Data</div>
                            <div className="text-xs opacity-70">Restore from backup</div>
                          </div>
                        </label>
                      </Button>
                    </div>
                  </div>

                  <div className="cosmic-card p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-accent" />
                      Privacy & Security
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your cosmic journey data is stored securely on your device. We respect your privacy - 
                      no personal information is collected or transmitted to external servers. 
                      You maintain full control over your data and can export or delete it at any time 
                      through your browser settings.
                    </p>
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

export default Settings;