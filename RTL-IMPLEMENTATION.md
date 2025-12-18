To properly implement RTL/LTR support using CSS in React Native with i18next:

## Best Approach: Hybrid Solution

The BEST way to implement RTL in React Native is a **hybrid approach**:

1. **Enable RTL Support** in app.json (iOS and Android)
   - Set `supportsRTL: true` so the platform allows RTL

2. **Allow RTL but Don't Force It** at app startup
   - `I18nManager.allowRTL(true)` - Allow RTL capability
   - `I18nManager.forceRTL(false)` - Don't force it initially

3. **Use I18nManager with Language Detection**
   - When language changes, call `I18nManager.forceRTL(isArabic)`
   - This REQUIRES app reload only on FIRST RTL switch
   - After that, direction persists correctly

4. **Add CSS-Based Helpers** for instant visual feedback
   - Use `useRTL()` hook for conditional styling
   - Apply `textAlign`, `flexDirection` based on language
   - This provides immediate visual updates even before reload

## Why This Is Best:

1. **Platform Native**: Uses React Native's built-in RTL system
2. **Performant**: Leverages platform-level optimizations
3. **Consistent**: All components respect RTL automatically
4. **Minimal Restart**: Only needs reload on FIRST language change
5. **CSS Enhancements**: Additional hooks for fine-tuned control

## Implementation:

```typescript
// In components/rtl-view.tsx
const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

useEffect(() => {
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    // App will reload automatically on next navigation
  }
}, [isRTL]);
```

This is better than pure CSS because:
- React Native doesn't fully support CSS `dir="rtl"`
- I18nManager affects ALL layout calculations
- Native components (TextInput, etc.) handle RTL properly
- Platform-level text rendering respects direction
