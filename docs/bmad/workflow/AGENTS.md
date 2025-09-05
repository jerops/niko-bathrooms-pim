# BMAD Agents for Niko Bathrooms PIM

## 🤖 Available Agents

This document describes the BMAD agents available for the Niko Bathrooms PIM project and how to use them effectively in Cursor IDE.

---

## 📋 **Product Manager (@pm)**

### **Role & Expertise**
- Product strategy and roadmap planning
- User story creation and refinement
- Requirement gathering and validation
- Stakeholder communication
- Business impact analysis

### **Usage in Cursor**
```
@pm Create a user story for improving mobile wishlist performance

@pm Review the current PRD and suggest new features for v6.0

@pm Analyze user feedback and prioritize enhancement requests

@pm Break down the AI recommendations epic into implementable stories
```

### **Specializations**
- **User Experience**: Focuses on customer and retailer journey optimization
- **Business Value**: Ensures features align with business objectives
- **Market Analysis**: Considers competitive landscape and market trends
- **ROI Assessment**: Evaluates feature value vs implementation cost

---

## 🏗️ **Architect (@architect)**

### **Role & Expertise**
- System architecture and design
- Technical decision making
- Performance optimization strategies
- Security architecture
- Scalability planning

### **Usage in Cursor**
```
@architect Design a scalable approach for AI-powered product recommendations

@architect Review the current modular architecture for potential improvements

@architect Plan the technical implementation for real-time collaboration features

@architect Evaluate different approaches for mobile app architecture
```

### **Specializations**
- **Modular Design**: Expert in monorepo and package architecture
- **Performance**: Focuses on load times, bundle optimization, caching
- **Security**: Implements defense-in-depth security strategies
- **Integration**: Designs seamless API and service integrations

---

## 👨‍💻 **Developer (@dev)**

### **Role & Expertise**
- Code implementation and development
- Technical problem solving
- Code review and quality assurance
- Testing and debugging
- Technology integration

### **Usage in Cursor**
```
@dev Implement story 1.1 bundle size optimization with specific focus on tree shaking

@dev Review the current authentication code and suggest improvements

@dev Debug the mobile wishlist synchronization issue

@dev Implement lazy loading for the user management package
```

### **Specializations**
- **TypeScript**: Expert in modern TypeScript patterns and best practices
- **Performance**: Implements optimizations for speed and efficiency
- **Testing**: Creates comprehensive test suites and quality assurance
- **Integration**: Handles complex system integrations and APIs

---

## 🧪 **QA Engineer (@qa)**

### **Role & Expertise**
- Quality assurance and testing
- Test case creation and execution
- Bug identification and reporting
- Performance validation
- User acceptance testing

### **Usage in Cursor**
```
@qa Create comprehensive test cases for story 1.2 lazy loading implementation

@qa Review the authentication flow and identify potential security issues

@qa Design performance tests for mobile experience validation

@qa Validate the accessibility compliance for the new mobile features
```

### **Specializations**
- **Test Automation**: Creates automated test suites for regression testing
- **Performance Testing**: Validates load times, responsiveness, scalability
- **Security Testing**: Identifies vulnerabilities and security weaknesses
- **User Experience**: Ensures functionality meets user needs and expectations

---

## 📊 **Scrum Master (@sm)**

### **Role & Expertise**
- Story management and workflow coordination
- Sprint planning and estimation
- Dependency tracking and resolution
- Team collaboration facilitation
- Process improvement

### **Usage in Cursor**
```
@sm Break down Epic 1 Performance Optimization into detailed implementation stories

@sm Review story dependencies and create an optimal implementation sequence

@sm Estimate effort for the mobile experience enhancement epic

@sm Create a sprint plan for the next 4 weeks of development
```

### **Specializations**
- **Story Creation**: Transforms requirements into detailed development stories
- **Dependency Management**: Identifies and resolves blocking dependencies
- **Estimation**: Provides accurate effort estimation for development work
- **Process Optimization**: Improves development workflow and efficiency

---

## 🎯 **Agent Collaboration Patterns**

### **Story Development Workflow**
```mermaid
graph LR
    A[@pm] --> B[@architect]
    B --> C[@sm]
    C --> D[@dev]
    D --> E[@qa]
    E --> F{Review}
    F -->|Pass| G[Complete]
    F -->|Issues| D
```

### **Common Collaboration Scenarios**

#### **New Feature Development**
1. **@pm**: Creates initial user story and requirements
2. **@architect**: Designs technical implementation approach
3. **@sm**: Breaks down into implementable tasks with dependencies
4. **@dev**: Implements the feature according to specifications
5. **@qa**: Tests implementation and validates requirements

#### **Performance Optimization**
1. **@architect**: Analyzes current performance and identifies bottlenecks
2. **@pm**: Prioritizes optimization opportunities based on business impact
3. **@sm**: Creates optimization stories with clear success metrics
4. **@dev**: Implements optimizations following best practices
5. **@qa**: Validates performance improvements and regression testing

#### **Bug Investigation and Resolution**
1. **@qa**: Documents bug with reproduction steps and impact
2. **@architect**: Analyzes root cause and suggests solution approach
3. **@dev**: Implements fix with appropriate testing
4. **@qa**: Validates fix and performs regression testing
5. **@sm**: Updates documentation and process improvements

---

## 📝 **Agent Usage Best Practices**

### **Effective Prompting**
- **Be Specific**: Provide clear context and requirements
- **Include Constraints**: Mention technical, business, or time constraints
- **Reference Documentation**: Point to relevant PRD, architecture, or story docs
- **Ask Follow-ups**: Use iterative questioning for detailed guidance

### **Context Sharing**
- **Current State**: Always describe what exists now
- **Desired State**: Clearly articulate what you want to achieve
- **Acceptance Criteria**: Define what success looks like
- **Dependencies**: Mention any blocking or related work

### **Quality Assurance**
- **Cross-Reference**: Validate agent suggestions against project standards
- **Multiple Perspectives**: Get input from different agent types
- **Documentation**: Document decisions and rationale
- **Team Review**: Share agent interactions with team for feedback

---

## 🔧 **Cursor IDE Integration**

### **Setting Up BMAD Agents in Cursor**

1. **Agent Profiles**: Configure each agent as a specialized assistant
2. **Context Files**: Use the generated BMAD documentation as context
3. **Project Understanding**: Agents understand the modular architecture
4. **Story Templates**: Use standardized story format for consistency

### **Workflow Integration**

```typescript
// Example: Using @dev agent for implementation
/*
@dev I'm implementing Story 1.1 Bundle Size Optimization. 

Current state: Bundle is 45KB gzipped
Target: Reduce to <40KB gzipped
Constraints: 
- Cannot break existing functionality
- Must maintain TypeScript strict mode
- Performance must improve, not degrade

Please help me:
1. Analyze current bundle structure
2. Identify optimization opportunities
3. Provide specific implementation steps
4. Suggest testing approach

Context files: 
- docs/bmad/stories/epic-1-performance/story-1.1-bundle-optimization.md
- packages/pim-bundle/src/index.ts
*/
```

---

## 📞 **Getting Started**

### **First Steps**
1. **Review Documentation**: Read PRD and Architecture documents
2. **Understand Current State**: Familiarize yourself with existing codebase
3. **Choose Your Agent**: Select appropriate agent for your current task
4. **Provide Context**: Share relevant documentation and current situation
5. **Iterate**: Use follow-up questions to refine guidance

### **Common Starting Points**
- **New to Project**: Start with @pm for overview and current priorities
- **Technical Implementation**: Use @architect for system understanding
- **Specific Development**: Engage @dev for implementation guidance
- **Quality Concerns**: Consult @qa for testing and validation approach
- **Project Planning**: Work with @sm for story and sprint planning

---

*These agents are designed to work seamlessly with your Cursor IDE and provide expert guidance throughout the development process.*
