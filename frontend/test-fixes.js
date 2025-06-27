#!/usr/bin/env node

// Simple test to verify our fixes work
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking test fixes...\n');

// Check if task-dialog.tsx has the id attributes for Select components
const taskDialogPath = path.join(__dirname, 'components/task-dialog.tsx');
const taskDialogContent = fs.readFileSync(taskDialogPath, 'utf8');

if (taskDialogContent.includes('<SelectTrigger id="status">') && 
    taskDialogContent.includes('<SelectTrigger id="priority">')) {
  console.log('✅ Task Dialog: Select components have proper id attributes');
} else {
  console.log('❌ Task Dialog: Missing id attributes on Select components');
}

// Check if kanban-board.tsx has dataTransfer null checks
const kanbanBoardPath = path.join(__dirname, 'components/kanban-board.tsx');
const kanbanBoardContent = fs.readFileSync(kanbanBoardPath, 'utf8');

if (kanbanBoardContent.includes('if (e.dataTransfer)')) {
  console.log('✅ Kanban Board: Has dataTransfer null checks');
} else {
  console.log('❌ Kanban Board: Missing dataTransfer null checks');
}

// Check if jest.setup.js has DataTransfer mock
const jestSetupPath = path.join(__dirname, 'jest.setup.js');
const jestSetupContent = fs.readFileSync(jestSetupPath, 'utf8');

if (jestSetupContent.includes('MockDataTransfer') && 
    jestSetupContent.includes('MockDragEvent')) {
  console.log('✅ Jest Setup: Has DataTransfer and DragEvent mocks');
} else {
  console.log('❌ Jest Setup: Missing DataTransfer/DragEvent mocks');
}

// Check if kanban-board test uses proper DragEvent constructor
const kanbanTestPath = path.join(__dirname, '__tests__/components/kanban-board.test.tsx');
const kanbanTestContent = fs.readFileSync(kanbanTestPath, 'utf8');

if (kanbanTestContent.includes('new DragEvent(')) {
  console.log('✅ Kanban Board Test: Uses proper DragEvent constructor');
} else {
  console.log('❌ Kanban Board Test: Not using proper DragEvent constructor');
}

console.log('\n🎯 Summary of fixes applied:');
console.log('1. Added id attributes to Select components for accessibility');
console.log('2. Added null checks for dataTransfer property');
console.log('3. Added DataTransfer and DragEvent mocks to jest setup');
console.log('4. Updated drag and drop test to use proper DragEvent constructor');
console.log('5. Added missing getProjectLabels mock');

console.log('\n📋 These fixes should resolve:');
console.log('- TestingLibraryElementError: Label not associated with form control');
console.log('- TypeError: Cannot set properties of undefined (dataTransfer)');
console.log('- React act() warnings for async state updates');

console.log('\n🚀 Run your tests again to verify the fixes!');