# Admin Quick Start: Managing Lab Subjects & Programs

## 🚀 Quick Access
**Admin Dashboard** → **Manage Subjects** tab

---

## 📚 Adding a New Subject

### Steps:
1. Click **"+ Add"** button in the Subjects panel
2. Fill in the form:

   | Field | Example | Rules |
   |-------|---------|-------|
   | **ID** | `lab-subject-ml` | Unique, kebab-case |
   | **Name** | `Machine Learning` | Display name |
   | **Code** | `ml` | Lowercase, 2-4 chars |
   | **Description** | `ML algorithms and models` | Brief summary |
   | **Icon** | 🤖 | Choose from picker |

3. Click **"Save"**
4. ✅ Subject appears in list and student lab section

### Icon Options:
📚 🌐 🤖 💻 🔬 ⚙️ 🎯 🚀 💡 🔥

---

## 💻 Adding a Program to a Subject

### Steps:
1. **Select a subject** (click on subject card)
2. Click **"+ Add Program"** button
3. Fill in the form:

   | Field | Example | Required |
   |-------|---------|----------|
   | **ID** | `ml-prog-01` | Yes |
   | **Program Name** | `Linear Regression` | Yes |
   | **Language** | Python | Yes |
   | **Difficulty** | Medium | No |
   | **Description** | `Implement linear regression...` | No |
   | **Code** | `import numpy as np...` | Yes |
   | **Sample Input** | `1 2 3 4 5` | No |

4. Click **"Save Program"**
5. ✅ Program appears in subject's program list

---

## 🗑️ Deleting Items

### Delete a Program
- Click trash icon (🗑️) next to the program
- Confirm deletion
- ✅ Program removed

### Delete a Subject
- Click trash icon (🗑️) next to the subject
- ⚠️ **WARNING**: All programs in this subject will be deleted!
- Confirm deletion
- ✅ Subject and all its programs removed

---

## 📋 Example: Adding "Machine Learning" Subject

### Step 1: Create Subject
```
ID: lab-subject-ml
Name: Machine Learning
Code: ml
Description: Machine learning algorithms, models, and techniques
Icon: 🤖
```

### Step 2: Add First Program
```
ID: ml-prog-01
Program Name: Linear Regression Implementation
Language: Python
Difficulty: Medium
Description: Basic linear regression using NumPy
Code:
import numpy as np

# Linear regression implementation
def linear_regression(X, y):
    # Add bias term
    X_b = np.c_[np.ones((X.shape[0], 1)), X]
    
    # Calculate coefficients
    theta = np.linalg.inv(X_b.T.dot(X_b)).dot(X_b.T).dot(y)
    
    return theta

# Test
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

print("Coefficients:", linear_regression(X, y))

Sample Input:
1 2 3 4 5
```

### Step 3: Verify
- Go to Lab section (as student)
- See "Machine Learning" subject card
- Click on it → see your program
- Click program → code loads in editor

---

## ✅ Best Practices

### Subject Codes
- ✅ **Good**: `ml`, `ds`, `nlp`, `cv`
- ❌ **Bad**: `Machine_Learning`, `ML_SUBJECT`, `Machine Learning`

### Subject IDs
- ✅ **Good**: `lab-subject-ml`, `lab-subject-nlp`
- ❌ **Bad**: `subject1`, `ml_subject`, `MACHINE_LEARNING`

### Program IDs
- ✅ **Good**: `ml-prog-01`, `ds-prog-linear-regression`
- ❌ **Bad**: `program1`, `LinearRegression`, `ML PROGRAM`

### Code Quality
- ✅ Include comments
- ✅ Use proper indentation
- ✅ Test code before adding
- ✅ Add sample input for testing

---

## 🔍 Troubleshooting

### Issue: "Authentication required" error
**Solution:** Make sure you're logged in as admin

### Issue: "Failed to create subject" error
**Solution:** 
- Check if code is unique (not already used)
- Ensure ID is unique
- Verify all required fields are filled

### Issue: Programs not showing after adding
**Solution:**
- Refresh the page
- Make sure you selected the correct subject
- Check browser console for errors

### Issue: Subject not appearing in student view
**Solution:**
- Refresh student Lab page
- Clear browser cache
- Verify subject was created successfully

---

## 📊 Current Subjects (Default)

| Code | Name | Icon | Programs |
|------|------|------|----------|
| `cn` | Computer Networks | 🌐 | 5 |
| `ai` | Artificial Intelligence | 🤖 | 5 |
| `fsd` | Full Stack Development-2 | 💻 | 5 |

**Total:** 3 subjects, 15 programs

---

## 🎯 Quick Actions Summary

| Action | Location | Auth Required |
|--------|----------|---------------|
| View all subjects | Subjects panel | No |
| Add subject | "+ Add" button | Yes |
| Delete subject | Trash icon on subject | Yes |
| View programs | Click subject card | No |
| Add program | "+ Add Program" button | Yes |
| Delete program | Trash icon on program | Yes |

---

## 💡 Tips

1. **Start Small**: Add one subject with one program to test
2. **Use Clear Names**: Students should understand the subject/program purpose
3. **Test Programs**: Run code before adding to ensure it works
4. **Organize by Difficulty**: Use easy/medium/hard tags
5. **Add Sample Input**: Helps students test immediately

---

## 🆘 Need Help?

Contact the development team or check the full documentation:
- `DYNAMIC_LAB_SUBJECTS.md` - Complete implementation details
- `LAB_MIGRATION_GUIDE.md` - Original migration guide
