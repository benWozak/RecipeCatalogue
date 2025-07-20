# Error Handling Components

This directory contains robust error handling components for the React application.

## Components

### ErrorBoundary
The base error boundary component that catches JavaScript errors in child components.

**Props:**
- `children` - Child components to wrap
- `fallback` - Optional custom fallback UI
- `onError` - Optional error callback function
- `level` - Error boundary level: 'global' | 'route' | 'feature'

### GlobalErrorBoundary
Wraps the entire application to catch unhandled errors.
- Already implemented in `main.tsx`
- Provides global error logging
- Shows application-level error UI

### RouteErrorBoundary
Wraps individual routes to catch route-specific errors.
- Already implemented in `App.tsx` for all routes
- Provides context-aware error messages
- Offers navigation recovery options

### FeatureErrorBoundary
Wraps specific features or components.

**Props:**
- `featureName` - Name of the feature for error context
- `fallbackMessage` - Custom error message

**Usage:**
```tsx
import { FeatureErrorBoundary } from '@/components/error';

<FeatureErrorBoundary 
  featureName="Recipe Card" 
  fallbackMessage="Unable to display recipe card"
>
  <RecipeCard recipe={recipe} />
</FeatureErrorBoundary>
```

## Error Handler Hook

### useErrorHandler
Provides consistent error handling utilities.

**Features:**
- Error classification (network, auth, validation, component, unknown)
- User-friendly error messages
- Async error handling
- Error boundary wrapper functions

**Usage:**
```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { handleError, handleAsyncError, clearError } = useErrorHandler();

// Handle synchronous errors
try {
  // risky operation
} catch (error) {
  handleError(error, { feature: 'recipe', action: 'create' });
}

// Handle async operations
const result = await handleAsyncError(
  () => recipeService.getRecipes(),
  { feature: 'recipe', action: 'fetch' }
);
```

## Error Types

The system classifies errors into these types:
- **network** - Connection issues, fetch failures
- **auth** - Authentication/authorization failures  
- **validation** - Form validation errors
- **component** - React component rendering errors
- **unknown** - Unclassified errors

## Testing

Use `ErrorTestComponent` to test error boundaries:

```tsx
import ErrorTestComponent from '@/components/error/ErrorTestComponent';

// Add to any page for testing
<ErrorTestComponent />
```

## Best Practices

1. **Use appropriate error boundary levels:**
   - Global: Critical app-wide errors
   - Route: Page-level errors
   - Feature: Component-specific errors

2. **Provide context in error handling:**
   ```tsx
   handleError(error, {
     feature: 'recipes',
     action: 'create',
     component: 'RecipeForm'
   });
   ```

3. **Use FeatureErrorBoundary for critical components:**
   - Recipe displays
   - Form components
   - Data visualization components

4. **Don't over-wrap with error boundaries:**
   - Avoid nesting similar boundary types
   - Let errors bubble up when appropriate