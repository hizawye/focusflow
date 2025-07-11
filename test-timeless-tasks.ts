// Test script to verify timeless tasks functionality
import { generateScheduleWithGemini } from './gemini';

async function testTimelessTasks() {
  console.log('🧪 Testing timeless tasks...\n');

  try {
    // Test 1: Simple timeless task
    console.log('Test 1: Simple timeless task');
    const result1 = await generateScheduleWithGemini("call mom");
    console.log('Result:', JSON.stringify(result1, null, 2));
    
    const task1 = result1[0];
    if (task1.isTimeless && !task1.start && !task1.end) {
      console.log('✅ Test 1 PASSED: Task is timeless without start/end times\n');
    } else {
      console.log('❌ Test 1 FAILED: Task should be timeless without start/end times\n');
    }

    // Test 2: Multiple timeless tasks
    console.log('Test 2: Multiple timeless tasks');
    const result2 = await generateScheduleWithGemini("buy groceries and write report");
    console.log('Result:', JSON.stringify(result2, null, 2));
    
    const allTimeless = result2.every(task => task.isTimeless && !task.start && !task.end);
    if (allTimeless) {
      console.log('✅ Test 2 PASSED: All tasks are timeless without start/end times\n');
    } else {
      console.log('❌ Test 2 FAILED: Not all tasks are timeless\n');
    }

    // Test 3: Mixed tasks (should detect some as timeless, some as timed)
    console.log('Test 3: Mixed tasks');
    const result3 = await generateScheduleWithGemini("meeting at 2pm, call dad, and 1 hour workout");
    console.log('Result:', JSON.stringify(result3, null, 2));
    
    const hasTimeless = result3.some(task => task.isTimeless);
    const hasFixed = result3.some(task => task.start && task.end && !task.isTimeless);
    const hasFlexible = result3.some(task => task.isFlexible && !task.isTimeless);
    
    if (hasTimeless && (hasFixed || hasFlexible)) {
      console.log('✅ Test 3 PASSED: Mixed task types detected correctly\n');
    } else {
      console.log('❌ Test 3 FAILED: Mixed task types not detected correctly\n');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTimelessTasks();
}

export { testTimelessTasks };
