import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  Alert,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define the test data structure
interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string | null;
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

const CreateTest = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      text: '',
      options: [
        { id: '1', text: '' },
        { id: '2', text: '' },
      ],
      correctOptionId: null,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: (questions.length + 1).toString(),
        text: '',
        options: [
          { id: '1', text: '' },
          { id: '2', text: '' },
        ],
        correctOptionId: null,
      },
    ]);
  };

  const updateQuestionText = (questionId: string, text: string) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, text } : q))
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: (q.options.length + 1).toString(), text: '' },
            ],
          };
        }
        return q;
      })
    );
  };

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId ? { ...o, text } : o
            ),
          };
        }
        return q;
      })
    );
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            correctOptionId: optionId,
          };
        }
        return q;
      })
    );
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      Alert.alert("Cannot Remove", "Test must have at least one question");
      return;
    }
    
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          // Don't allow fewer than 2 options
          if (q.options.length <= 2) {
            Alert.alert("Cannot Remove", "Question must have at least two options");
            return q;
          }
          
          // If removing the correct option, reset correctOptionId
          const newCorrectOptionId = 
            q.correctOptionId === optionId ? null : q.correctOptionId;
          
          return {
            ...q,
            options: q.options.filter((o) => o.id !== optionId),
            correctOptionId: newCorrectOptionId,
          };
        }
        return q;
      })
    );
  };

  const saveTest = () => {
    // Validate test
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a test title");
      return;
    }

    // Check if all questions have text
    for (const question of questions) {
      if (!question.text.trim()) {
        Alert.alert("Error", "All questions must have text");
        return;
      }

      // Check if all options have text
      for (const option of question.options) {
        if (!option.text.trim()) {
          Alert.alert("Error", "All options must have text");
          return;
        }
      }

      // Check if correct answer is selected
      if (!question.correctOptionId) {
        Alert.alert("Error", "Each question must have a correct answer selected");
        return;
      }
    }

    // Create test object
    const newTest: Test = {
      id: Date.now().toString(),
      title,
      description,
      questions,
    };

    // In a real app, you would save this to a database or AsyncStorage
    // For this example, we'll save it to the global state
    try {
      // @ts-ignore
      global.testsData = [...(global.testsData || []), newTest];
      
      Alert.alert(
        "Success", 
        "Test created successfully!",
        [
          { 
            text: "OK", 
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save test");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Test Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter test title"
          />

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter test description"
            multiline
          />

          <Text style={styles.sectionTitle}>Questions</Text>
          
          {questions.map((question, questionIndex) => (
            <View key={question.id} style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>
                <Pressable 
                  onPress={() => removeQuestion(question.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </Pressable>
              </View>
              
              <TextInput
                style={styles.questionInput}
                value={question.text}
                onChangeText={(text) => updateQuestionText(question.id, text)}
                placeholder="Enter question"
                multiline
              />

              <Text style={styles.optionsTitle}>Options</Text>
              
              {question.options.map((option) => (
                <View key={option.id} style={styles.optionContainer}>
                  <Pressable
                    style={[
                      styles.radioButton,
                      question.correctOptionId === option.id && styles.radioButtonSelected,
                    ]}
                    onPress={() => setCorrectOption(question.id, option.id)}
                  >
                    {question.correctOptionId === option.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </Pressable>
                  
                  <TextInput
                    style={styles.optionInput}
                    value={option.text}
                    onChangeText={(text) =>
                      updateOptionText(question.id, option.id, text)
                    }
                    placeholder={`Option ${option.id}`}
                  />
                  
                  <Pressable
                    onPress={() => removeOption(question.id, option.id)}
                    style={styles.removeOptionButton}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#ff3b30" />
                  </Pressable>
                </View>
              ))}

              <Pressable
                style={styles.addOptionButton}
                onPress={() => addOption(question.id)}
              >
                <Text style={styles.addOptionButtonText}>+ Add Option</Text>
              </Pressable>
            </View>
          ))}

          <Pressable
            style={styles.addQuestionButton}
            onPress={addQuestion}
          >
            <Text style={styles.addQuestionButtonText}>+ Add Question</Text>
          </Pressable>

          <Pressable
            style={styles.saveButton}
            onPress={saveTest}
          >
            <Text style={styles.saveButtonText}>Save Test</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    color: '#012f01',
  },
  questionContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#012f01',
  },
  removeButton: {
    padding: 5,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#012f01',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    borderColor: '#012f01',
  },
  radioButtonInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#012f01',
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  removeOptionButton: {
    padding: 5,
    marginLeft: 10,
  },
  addOptionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#012f01',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 5,
  },
  addOptionButtonText: {
    color: '#012f01',
    fontWeight: '600',
  },
  addQuestionButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#012f01',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 25,
  },
  addQuestionButtonText: {
    color: '#012f01',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#012f01',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default CreateTest;
