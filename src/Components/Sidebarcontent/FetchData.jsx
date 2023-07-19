import React, { useEffect, useState } from 'react';
import { db } from '../../Firebase';
import {query, collection, onSnapshot, 
    updateDoc, doc, addDoc, deleteDoc, editDoc} from 'firebase/firestore';

// Fetch years data from Firestore
useEffect(() => {
    const unsubscribe = db.collection('years').onSnapshot((snapshot) => {
      const yearData = snapshot.docs.map((doc) => ({
        id: doc.id,
        // Extract other year properties from doc.data()
        // For example: name, startDate, endDate, etc.
      }));
      setYears(yearData);
    });
  
    return () => unsubscribe();
  }, [db]);
  
  // Fetch months data for selected year from Firestore
  useEffect(() => {
    if (selectedYear) {
      const unsubscribe = db
        .collection('years')
        .doc(selectedYear.id)
        .collection('months')
        .onSnapshot((snapshot) => {
          const monthData = snapshot.docs.map((doc) => ({
            id: doc.id,
            // Extract other month properties from doc.data()
          }));
          // Update selectedMonth state with fetched data
        });
  
      return () => unsubscribe();
    }
  }, [db, selectedYear]);
  
  // Fetch weeks data for selected month from Firestore
  useEffect(() => {
    if (selectedMonth) {
      const unsubscribe = db
        .collection('years')
        .doc(selectedYear.id)
        .collection('months')
        .doc(selectedMonth.id)
        .collection('weeks')
        .onSnapshot((snapshot) => {
          const weekData = snapshot.docs.map((doc) => ({
            id: doc.id,
            // Extract other week properties from doc.data()
          }));
          // Update selectedWeek state with fetched data
        });
  
      return () => unsubscribe();
    }
  }, [db, selectedYear, selectedMonth]);
  
  // Fetch days data for selected week from Firestore
  useEffect(() => {
    if (selectedWeek) {
      const unsubscribe = db
        .collection('years')
        .doc(selectedYear.id)
        .collection('months')
        .doc(selectedMonth.id)
        .collection('weeks')
        .doc(selectedWeek.id)
        .collection('days')
        .onSnapshot((snapshot) => {
          const dayData = snapshot.docs.map((doc) => ({
            id: doc.id,
            // Extract other day properties from doc.data()
          }));
          // Do something with fetched day data
        });
  
      return () => unsubscribe();
    }
  }, [db, selectedYear, selectedMonth, selectedWeek]);

  