"use strict"
/**
 * ExerciseLanguage
 */
Object.defineProperty(exports, "__esModule", { value: true })
exports.isExerciseLanguage = exports.exerciseLanguages = void 0
exports.exerciseLanguages = ["go", "java", "javascript", "python", "rust"]
var isExerciseLanguage = function (value) {
	return exports.exerciseLanguages.includes(value)
}
exports.isExerciseLanguage = isExerciseLanguage
