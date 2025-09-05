# BMAD Code Analysis Configuration
## Codebase Flattener for AI Model Consumption

### **Purpose**
This configuration enables the BMAD Method codebase flattener to create AI-optimized bundles of the Niko Bathrooms PIM system for analysis, debugging, and development assistance.

---

## 🔧 **Flattener Configuration**

### **Basic Usage**
```bash
# Generate complete codebase analysis bundle
npx bmad-method flatten

# Specific directory analysis
npx bmad-method flatten -i packages/auth -o auth-analysis.xml

# Production code only (exclude docs and tests)
npx bmad-method flatten --production-only
```

### **Configuration Options**

#### **Input Directories**
```json
{
  "include": [
    "packages/*/src/**/*.ts",
    "packages/*/src/**/*.js",
    "packages/*/README.md",
    "packages/*/package.json",
    "docs/bmad/**/*.md",
    "*.md"
  ],
  "exclude": [
    "node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/test/**",
    "**/.git/**"
  ]
}
```

#### **Analysis Profiles**

##### **Development Analysis**
```bash
# Complete system analysis for development planning
npx bmad-method flatten \
  --include "packages/*/src/**/*.ts" \
  --include "docs/bmad/**/*.md" \
  --output "complete-system-analysis.xml"
```

##### **Package Analysis**
```bash
# Individual package analysis
npx bmad-method flatten \
  --input "packages/auth" \
  --output "auth-package-analysis.xml"
```

##### **Architecture Analysis**
```bash
# Architecture and documentation analysis
npx bmad-method flatten \
  --include "docs/**/*.md" \
  --include "README.md" \
  --include "*/README.md" \
  --output "architecture-analysis.xml"
```

##### **Story Context Analysis**
```bash
# Generate context bundle for specific story implementation
npx bmad-method flatten \
  --include "packages/pim-bundle/**/*.ts" \
  --include "packages/core/**/*.ts" \
  --include "docs/bmad/stories/epic-1-performance/story-1.1*.md" \
  --output "story-1.1-context.xml"
```

---

## 🎯 **AI Analysis Use Cases**

### **1. Code Review and Quality Analysis**
```xml
<!-- Use case: AI code review -->
Upload: complete-system-analysis.xml
Prompt: "Review this codebase for potential improvements, security issues, and best practices. Focus on TypeScript patterns, performance optimizations, and maintainability."
```

### **2. Architecture Analysis**
```xml
<!-- Use case: Architecture review -->
Upload: architecture-analysis.xml
Prompt: "Analyze the current architecture and suggest improvements for scalability, maintainability, and performance. Consider the modular monorepo approach."
```

### **3. Story Implementation Guidance**
```xml
<!-- Use case: Story implementation -->
Upload: story-1.1-context.xml
Prompt: "Help implement Story 1.1 bundle optimization. Analyze the current code and provide specific optimization recommendations."
```

### **4. Bug Investigation**
```xml
<!-- Use case: Bug analysis -->
Upload: auth-package-analysis.xml
Prompt: "There's an authentication issue where users can't log out properly. Analyze the auth package and identify potential causes."
```

### **5. Performance Optimization**
```xml
<!-- Use case: Performance analysis -->
Upload: complete-system-analysis.xml
Prompt: "Analyze the codebase for performance bottlenecks. Suggest specific optimizations for bundle size, load time, and runtime performance."
```

---

## 📋 **Analysis Templates**

### **Code Review Template**
```markdown
## AI Code Review Request

**Codebase**: [Bundle Name]
**Focus Areas**: [Security, Performance, Maintainability, etc.]
**Specific Concerns**: [Any specific issues or questions]

**Analysis Request**:
Please review this codebase and provide:
1. Overall code quality assessment
2. Security vulnerability analysis
3. Performance optimization opportunities
4. Code maintainability improvements
5. Best practice recommendations
6. Specific action items with priority

**Context**: This is a production PIM system with [X] users, focusing on [business context].
```

### **Architecture Review Template**
```markdown
## AI Architecture Review Request

**System**: Niko Bathrooms PIM
**Current State**: [Brief description]
**Goals**: [What you want to achieve]

**Review Areas**:
- [ ] Scalability analysis
- [ ] Security architecture
- [ ] Performance architecture
- [ ] Maintainability structure
- [ ] Technology stack evaluation
- [ ] Integration patterns

**Specific Questions**:
1. [Question 1]
2. [Question 2]
3. [Question 3]
```

### **Story Implementation Template**
```markdown
## AI Story Implementation Request

**Story**: [Story ID and Title]
**Context**: [Brief story description]
**Current Implementation**: [What exists now]
**Requirements**: [What needs to be built]

**Request**:
Based on the story requirements and current codebase:
1. Analyze current implementation
2. Suggest implementation approach
3. Identify potential issues
4. Provide code examples
5. Recommend testing strategy
6. Estimate complexity and effort

**Constraints**: [Any technical or business constraints]
```

---

## 🛡️ **Security and Privacy**

### **Data Exclusion**
The flattener automatically excludes:
- API keys and secrets (via .gitignore patterns)
- User data and personal information
- Database credentials
- Third-party API tokens
- Environment-specific configuration

### **Safe Analysis Practices**
1. **Review Bundle**: Always review generated XML before sharing
2. **Remove Sensitive Data**: Manually remove any sensitive information
3. **Use Internal AI**: Prefer internal/private AI tools for sensitive code
4. **Version Control**: Don't commit analysis bundles to version control
5. **Time Limits**: Set expiration for shared analysis bundles

---

## 📊 **Bundle Metrics**

### **Typical Bundle Sizes**
- **Complete System**: ~500KB XML (all packages + docs)
- **Single Package**: ~50-150KB XML (depending on package size)
- **Documentation Only**: ~100KB XML (all docs and README files)
- **Story Context**: ~200KB XML (relevant code + story)

### **Generation Performance**
- **Complete System**: ~5-10 seconds
- **Single Package**: ~1-2 seconds
- **Large Packages**: ~3-5 seconds
- **Documentation**: ~2-3 seconds

---

## 🔄 **Integration with Development Workflow**

### **Pre-Development Analysis**
```bash
# Before starting a story, generate context bundle
npx bmad-method flatten --story-context story-1.1
# Use AI to understand current state and plan implementation
```

### **Code Review Process**
```bash
# Generate analysis bundle for code review
npx bmad-method flatten --changed-files
# Submit to AI for review before human review
```

### **Architecture Decisions**
```bash
# Generate architecture bundle for major decisions
npx bmad-method flatten --architecture-only
# Use AI to evaluate architectural options
```

### **Debugging Sessions**
```bash
# Generate focused bundle for bug investigation
npx bmad-method flatten --package auth --include-tests
# Use AI to analyze potential root causes
```

---

## 📝 **Best Practices**

### **Effective AI Prompts**
1. **Be Specific**: Ask for specific analysis or recommendations
2. **Provide Context**: Include business context and constraints
3. **Set Scope**: Define what type of feedback you want
4. **Ask Follow-ups**: Use iterative questioning for deeper insights
5. **Validate Suggestions**: Always validate AI recommendations

### **Bundle Management**
1. **Regular Generation**: Generate fresh bundles for analysis
2. **Focused Bundles**: Create targeted bundles for specific analysis
3. **Clean Up**: Remove old analysis bundles regularly
4. **Documentation**: Document analysis results and actions taken
5. **Team Sharing**: Share effective prompts and results with team

---

## 🎯 **Success Metrics**

### **Analysis Effectiveness**
- **Issue Detection**: Number of issues identified via AI analysis
- **Implementation Speed**: Faster story implementation with AI guidance
- **Code Quality**: Improved code quality metrics
- **Bug Prevention**: Reduced bugs through proactive analysis

### **Team Productivity**
- **Review Time**: Reduced code review time
- **Context Understanding**: Faster onboarding for new features
- **Decision Making**: Faster architectural decisions
- **Learning**: Improved team knowledge through AI insights

---

*This configuration enables effective AI-assisted development while maintaining security and privacy standards for the production PIM system.*
