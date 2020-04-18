# -*- coding: utf-8 -*-

from collections import defaultdict, Counter
import nltk
import json
import string
import sys

NUMBERS = {str(i) for i in range(0, 10)}
SENTENCE_STOP = NUMBERS | {'-'}

# Bible abbreviations and new line characters
REMOVE_WORDS = {'cor', 'jn', 'lk', 'n'}

# 0 for spanish, 1 for english
def generateTextClosenessArray(filename):
	ret = []
	table = str.maketrans("", "", string.punctuation + string.digits + u"«»¿¡—")
	words = []
	sentenceTokens = []
	with open(filename) as fp:
		for line in fp.readlines():
			line = line.strip()
			if not line:
				continue
			removeComments = line.split("**")[0]
			removeCommentsList = removeComments.split()
			strippedSentence = [word.translate(table).lower() for word in removeCommentsList if word.translate(table) and word.translate(table).lower() not in REMOVE_WORDS]
			sentenceTokens.append(strippedSentence)
			words.extend(strippedSentence)

	return words, sentenceTokens

		

def secondaryData(textArray):
	tokens = [s.lower() for s in textArray]
	data = defaultdict(Counter)

	for i, word in enumerate(tokens):
		for j in range(i - 3, i + 4):
			if 0 <= j < len(tokens) and j != i:
				data[word][tokens[j]] += 1
	return data

def secondaryTertiaryReformatter(data, labels):
	final = []
	assert(len(labels) == 3)
	top, adj, adjNum = labels
	for word, neighbors in data.items():
		element = {}
		element[top] = word
		neighborWords, neighborCounts = list(zip(*neighbors.items()))
		element[adj] = neighborWords
		element[adjNum] = neighborCounts
		final.append(element)
	return final

englishOverallTokens, englishSentenceTokens = generateTextClosenessArray("english.txt")
spanishOverallTokens, spanishSentenceTokens = generateTextClosenessArray("spanish.txt")
englishSecondaryDict, spanishSecondaryDict = secondaryData(englishOverallTokens), secondaryData(spanishOverallTokens)
print("Secondary View:")
print()
print("English text:")
print(json.dumps(secondaryTertiaryReformatter(englishSecondaryDict, ("word", "neighborWords", "neighborCounts"))))
print()

print("Spanish text:")
print(json.dumps(secondaryTertiaryReformatter(spanishSecondaryDict, ("word", "neighborWords", "neighborCounts"))))
print()
print()
print()

def sentenceTranslation(filename):
	givenScores = []

	givenToTargetOverall = defaultdict(Counter)
	targetToGivenOverall = defaultdict(Counter)
	givenSentenceWordcount = 0
	givenSentenceUnused = 0

	with open(filename) as fp:
		for line in fp.readlines():
			line = line.strip()

			# Blank lines are used for translator convenince. Simply skip over them
			if not line:
				continue
			splitLine = line.split('.')
			
			# Cases: unassociated spanish or english words, new sentence
			if len(splitLine) == 1:

				# New sentence
				if line[0] == "-":
					# Add the sentence dictionary to the sentences array and re-initialize
					givenScores.append((givenSentenceUnused, givenSentenceWordcount))
					givenSentenceWordcount = 0
					givenSentenceUnused = 0

				# count the unaccounted words to figure out how "bad" the translation is
				else:
					givenSentenceUnused += len(line.split(' '))
					givenSentenceWordcount += len(line.split(' '))

				continue

			given, target = splitLine
			given = given.strip().lower()
			target = target.strip().lower()

			givenToTargetOverall[given][target] += 1
			targetToGivenOverall[target][given] += 1

			# Add to word count
			givenSentenceWordcount += len(target.split(' ')) + len(given.split(' '))

		# Make sure file ends correctly
		fp.seek(0)
		end = fp.readlines()[-1]
		assert(end.strip() and end.strip()[0] == "-")

	# Normalize given to target
	for _, targets in givenToTargetOverall.items():
		total = sum(targets.values(), 0.0)
		for key in targets:
			targets[key] /= total

	# Normalize target to given
	for _, targets in targetToGivenOverall.items():
		total = sum(targets.values(), 0.0)
		for key in targets:
			targets[key] /= total



	return givenToTargetOverall, targetToGivenOverall, givenScores

def generateSentenceArray(filename):
	array = []
	with open(filename) as fp:
		for line in fp.readlines():
			line = line.strip()
			if not line:
				continue
			line = line.split("**")[0]
			array.append(line)
	return array


spanishToEnglishOverall, englishToSpanishOverall, spanishTranslationData = sentenceTranslation("spanishToEnglish.txt")
englishTranslationsFinal = secondaryTertiaryReformatter(englishToSpanishOverall, ("word", "translations", "scores"))
spanishTranslationsFinal = secondaryTertiaryReformatter(spanishToEnglishOverall, ("word", "translations", "scores"))

print("Tertiary Data:")
print()
print("Translations:")
print(json.dumps(englishTranslationsFinal + spanishTranslationsFinal))
print()
print("English Words:")
print(json.dumps(list(englishToSpanishOverall.keys())))
print()
print("Spanish Words:")
print(json.dumps(list(spanishToEnglishOverall.keys())))
print()
print()
print()


englishSentenceArray = generateSentenceArray("english.txt")
spanishSentenceArray = generateSentenceArray("spanish.txt")


def generateGroupingArrays(filename):
	# Spanish 
	spanishEnglishGroups = []
	with open(filename) as fp:
		for line in fp.readlines():
			line = line.strip()
			# Skip empty lines or lines in parenthesis
			if not line or line[0] == "(":
				continue
			spanishLine, englishLine = line.split(".")
			englishLine = [int(s) for s in englishLine.strip().split(" ")]
			spanishLine = [int(s) for s in spanishLine.strip().split(" ")]
			spanishEnglishGroups.append((spanishLine, englishLine))
	return spanishEnglishGroups


def generateTranslationScores(spanishTranslationData, spanishGroupingArray):
	translationScores = []
	for sentenceGroup in spanishGroupingArray:
		totalWords = 0
		totalUntranslated = 0
		for sentence in sentenceGroup:
			untranslated, words = spanishTranslationData[sentence]
			totalWords += words
			totalUntranslated += untranslated
		translationScore = 1 - (totalUntranslated / totalWords)
		translationScores.append(translationScore)
	return translationScores


spanishEnglishGroups = generateGroupingArrays('spanishEnglishGroups.txt')
translationScores = generateTranslationScores(spanishTranslationData, [s for s, e in spanishEnglishGroups])
assert(len(translationScores) == len(spanishEnglishGroups))

def buildPrimaryData(englishSentenceArray, spanishSentenceArray, spanishEnglishGroups, translationScores, englishSentenceTokens, spanishSentenceTokens):
	assert(len(spanishEnglishGroups) == len(translationScores))
	assert(len(englishSentenceArray) == len(englishSentenceTokens))
	assert(len(spanishSentenceArray) == len(spanishSentenceTokens))

	ret = []
	for index, ((spanishIndices, englishIndices), translationScore) in enumerate(zip(spanishEnglishGroups, translationScores)):
		element = {}
		spanish = " ".join([spanishSentenceArray[i].strip() for i in spanishIndices])
		english = " ".join([englishSentenceArray[i].strip() for i in englishIndices])
		spanishTokens = []

		for i in spanishIndices:
			spanishTokens.extend(englishSentenceTokens[i])

		englishTokens = []
		for i in englishIndices:
			englishTokens.extend(englishSentenceTokens[i])

		element['spanishTokens'] = spanishTokens
		element['englishTokens'] = englishTokens
		element['spanish'] = spanish
		element['english'] = english
		element['index'] = index
		element['score'] = translationScore
		ret.append(element)
	return ret

print("Primary data:")
print(json.dumps(buildPrimaryData(englishSentenceArray, spanishSentenceArray, spanishEnglishGroups, translationScores, englishSentenceTokens, spanishSentenceTokens)))