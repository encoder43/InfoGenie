# Contributing to InfoGenie

Thank you for your interest in contributing to InfoGenie! This guide will help you get started with contributing to our project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Contributions](#making-contributions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and encourage questions
- Focus on constructive collaboration
- Respect differing viewpoints and experiences

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/infogenie.git
   cd infogenie
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original/infogenie.git
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Backend Development
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# Start backend
cd backend
python -m uvicorn main:app --reload
```

### Frontend Development
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔨 Making Contributions

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug Fixes**: Fix issues and improve stability
- ✨ **New Features**: Add new functionality
- 📚 **Documentation**: Improve guides, comments, and docs
- 🎨 **UI/UX**: Enhance user interface and experience
- ⚡ **Performance**: Optimize speed and memory usage
- 🧪 **Tests**: Add or improve test coverage
- 🔧 **Refactoring**: Improve code quality and structure

### Contribution Workflow

1. **Check Open Issues**
   - Browse [GitHub Issues](https://github.com/yourusername/infogenie/issues)
   - Look for issues labeled `good first issue` or `help wanted`

2. **Create/Assign Issue**
   - If no relevant issue exists, create one describing your contribution
   - Assign yourself to the issue

3. **Develop Your Feature**
   - Work on your feature branch
   - Write tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend && python -m pytest
   
   # Frontend tests
   cd frontend && npm test
   
   # Integration tests
   python test_integration.py
   ```

5. **Submit Pull Request**
   - Push your feature branch
   - Create a Pull Request with a clear description
   - Reference related issues using `#issue_number`

## 📝 Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
- [ ] No merge conflicts
- [ ] Descriptive commit messages

### Pull Request Template

Use this template for your PR description:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #123
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Maintainers review code quality and approach
3. **Testing**: Automated tests must pass
4. **Documentation**: Ensure all docs are updated
5. **Final Approval**: Maintainer approves and merges

## 🎯 Coding Standards

### Python (Backend)

- **PEP 8**: Follow Python style guidelines
- **Type Hints**: Use type annotations for all functions
- **Docstrings**: Document all public functions and classes
- **Error Handling**: Use appropriate exception handling

```python
# Good example
from typing import List, Optional

def process_document(filename: str) -> Optional[str]:
    """
    Process document and extract text.
    
    Args:
        filename: Path to document file
        
    Returns:
        Extracted text or None if processing failed
        
    Raises:
        FileNotFoundError: If file doesn't exist
    """
    try:
        # Implementation
        return extracted_text
    except FileNotFoundError:
        logger.error(f"File not found: {filename}")
        return None
```

### TypeScript (Frontend)

- **Strict Mode**: Use TypeScript strict configuration
- **Interfaces**: Define clear interfaces for all data
- **Components**: Use functional components with hooks
- **Error Boundaries**: Implement proper error handling

```typescript
// Good example
interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isUser, 
  timestamp 
}) => {
  return (
    <div className={`message ${isUser ? 'user' : 'ai'}`}>
      {message}
    </div>
  );
};
```

### Git Commit Messages

Use conventional commit format:

```
type(scope): description

Examples:
feat(auth): add JWT token validation
fix(api): resolve CORS issue for file uploads
docs(readme): update installation instructions
test(rag): add unit tests for pipeline processing
```

## 🧪 Testing

### Backend Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_rag_pipeline.py

# Run with coverage
pytest --cov=backend/

# Run linting
flake8 backend/
black --check backend/
```

### Frontend Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint
npm run type-check

# Run E2E tests
npm run test:e2e
```

### Test Coverage Requirements

- **Minimum Coverage**: 80% for new code
- **Critical Paths**: 95% for RAG pipeline and API endpoints
- **Edge Cases**: Test error conditions and edge cases

## 📚 Documentation

### Code Documentation

- **Docstrings**: All public functions need docstrings
- **Comments**: Explain complex logic and algorithms
- **Type Hints**: Use throughout Python code
- **README**: Keep installation and usage updated

### Documentation Standards

```python
def process_query(query: str, context: List[str]) -> str:
    """
    Process user query using RAG pipeline.
    
    This function takes a user query and processes it through the
    retrieval-augmented generation pipeline to return a relevant answer.
    
    Args:
        query: The user's question in natural language
        context: List of relevant document chunks from retrieval
        
    Returns:
        Generated answer based on query and context
        
    Raises:
        ValueError: If query is empty or invalid
        RuntimeError: If model processing fails
        
    Example:
        >>> answer = process_query("What is machine learning?", context_chunks)
        >>> print(answer)
        "Machine learning is a subset of artificial intelligence..."
    """
```

### API Documentation

- Keep FastAPI auto-docs updated
- Document all endpoints with examples
- Include error response formats
- Add rate limiting and authentication info

## 🏷️ Issue Labels

We use these labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority:high`: High priority
- `priority:low`: Low priority
- `invalid`: Not an actual issue
- `wontfix`: Won't be addressed
- `duplicate`: Issue already exists

## 🎉 Recognition

Contributors will be:

- Added to our CONTRIBUTORS.md file
- Mentioned in release notes for significant contributions
- Invited to join our core team for regular contributors

## 📞 Getting Help

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Report bugs using GitHub Issues
- 📧 **Email**: Contact maintainers directly if needed

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

---

Thank you for contributing to InfoGenie! 🚀
